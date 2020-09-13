<template>
  <section id="teacher-profile">
    <div class="container section">
      <div class="profile-section teacher-schedule with-divider">
        <div id="timeslots" class="teacher-profile-schedule aside-navigation-item">
          <h3 class="section-title">
            <!-- 授課時間 -->
            <span>{{  $t('message.schedule.title') }}</span>
          </h3>
          <div class="section-body">
            <div class="schedule">
              <div>
                <div class="schedule-control-box at-control">
                  <div class="buttion-group">
                    <div class="el-button-group">
                      <button
                        type="button"
                        class="el-button el-button--default el-button--mini is-plain"
                        v-bind:class="{ 'is-disabled': todayIsInDataWeek }"
                        :disabled="todayIsInDataWeek"
                        v-on:click="$emit('last-week-schedule', firstDayAtWeek)"
                      >
                        <i class="el-icon-arrow-left"></i>
                      </button>
                      <button
                        type="button"
                        class="el-button el-button--default el-button--mini is-plain"
                        v-on:click="$emit('next-week-schedule', lastDayAtWeek)"
                      >
                        <i class="el-icon-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                  <div class="label-box">{{ label }}</div>
                  <div class="time-zone-description">
                    <!-- * 時間以 台北 (GMT+08:00) 顯示 -->
                    <span>{{ $t('message.schedule.time-zone-description') }}</span>
                  </div>
                </div>
                <div class="at-column-box">
                  <div v-for="(data, i) in scheduleDatas" :key="i" class="root">
                    <div
                      class="column-container disable_click"
                      v-bind:class="{ active: data.hasAvailable }"
                    >
                      <div class="title-box">
                        <div class="at-text-center">{{ data.weekday }}</div>
                        <div class="at-text-center">{{ data.day }}</div>
                      </div>
                      <div class="time-box">
                        <div v-for="(timeData, j) in data.timeDatas" :key="j" class="time-list">
                          <div
                            class="time at-text-center is-size-7"
                            v-bind:class="{ available: timeData.status === 'available', booked: timeData.status === 'booked' }"
                          >{{ timeData.time }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { format, endOfDay } from "date-fns";

const oneSecond = 1000;
const oneMinute = 60 * oneSecond;
const halfHour = 30 * oneMinute;

export default {
  name: "Schedule",
  data() {
    return {
      label: undefined,
      scheduleDatas: undefined,
      firstDayAtWeek: undefined,
      lastDayAtWeek: undefined,
      todayIsInDataWeek: undefined
    };
  },
  props: {
    datas: Object,
  },
  watch: {
    datas: function(newDatas) {

      this.firstDayAtWeek = getFirstDayAtWeek(newDatas.standardDate);
      this.lastDayAtWeek = getLastDayAtWeek(this.firstDayAtWeek);

      this.todayIsInDataWeek = isTodayInDataWeek(this.firstDayAtWeek, this.lastDayAtWeek);

      // I don't know why label date is over end of week at production, 
      // I guesst it is for condition of end day of week, 
      // but it should be end of day instead of next day.

      this.label = `${format(this.firstDayAtWeek, "yyyy/MM/dd")} - ${format(this.lastDayAtWeek, "dd")}`;

      const availableDatas = buildScheduleDatas(newDatas.available, "available");
      const bookedDatas = buildScheduleDatas(newDatas.booked, "booked");
      let allDatas = availableDatas.concat(bookedDatas);

      allDatas = groupByWeekday(allDatas, this.firstDayAtWeek, this.lastDayAtWeek);

      sortTime(allDatas);

      this.scheduleDatas = allDatas;
    }
  }
};

function buildScheduleDatas(datas, status) {
  let rs = [];
  datas.forEach((timeblock) => {
    const start = new Date(timeblock.start);
    const end = new Date(timeblock.end);
    const cellNumber = calcTimeCell(end, start);
    const data = buildScheduleData(start, status);
    rs.push(data);
    for (let i = 1; i < cellNumber; i++) {
      const nextTime = start.getTime() + i * halfHour;
      const nextDate = new Date(nextTime);
      const nextData = buildScheduleData(nextDate, status);
      rs.push(nextData);
    }
  });
  return rs;
}

function calcTimeCell(end, start) {
  const interval = end.getTime() - start.getTime();
  return interval / halfHour;
}

function buildScheduleData(date, status) {
  const time = formatTime(date);
  const timeDatas = time.split(",");
  return {
    weekday: timeDatas[0],
    day: timeDatas[1],
    time: timeDatas[2],
    status: status,
    date: date,
  };
}

function formatTime(date) {
  return date.toLocaleString(
    {},
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour12: false,
      hour: "numeric",
      minute: "numeric",
    }
  );
}

function groupByWeekday(datas, firstDayAtWeek, lastDayAtWeek) {
  const group = {};
  
  for (let i = 0; i < 7; i++) {
    const dayAtWeek = new Date(firstDayAtWeek.getTime());
    dayAtWeek.setDate(dayAtWeek.getDate() + i);
    const weekday = dayAtWeek.toLocaleString({}, { weekday: "short" });
    group[weekday] = {
      weekday: weekday,
      day: format(dayAtWeek, "dd"),
      timeDatas: [],
      hasAvailable: false,
    };
  }

  datas.forEach((data) => {
    if (data.date > lastDayAtWeek) {
      return;
    }

    const d = group[data.weekday];
    d.hasAvailable |= data.status === "available";
    d.timeDatas.push(data);
  });
  return Object.values(group);
}

function getFirstDayAtWeek(standardDate) {
  const clonedStandardDate = new Date(standardDate.getTime());
  return new Date(clonedStandardDate.setDate(clonedStandardDate.getDate() - clonedStandardDate.getDay()));
}

function getLastDayAtWeek(firstDate) {
  const clonedFirstDate = new Date(firstDate.getTime());
  return endOfDay(new Date(clonedFirstDate.setDate(clonedFirstDate.getDate() + 6)));
}

function isTodayInDataWeek(firstDayAtWeek, lastDayAtWeek) {

  // Cuz dummy data is at 2020/7/17
  const today = new Date(2020, 6, 17);
  return firstDayAtWeek <= today && today <= lastDayAtWeek;
}

function sortTime(datas) {
  datas.forEach((data) => {
    data.timeDatas.sort((d1, d2) => {
      return d1.time.localeCompare(d2.time);
    });
  });
}
</script>

<style>
@import "../assets/styles/css.css";
</style>