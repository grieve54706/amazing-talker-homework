<template>
  <div>
    <Schedule :datas="scheduleDatas" 
      v-on:next-week-schedule="onNextWeekSchedule" 
      v-on:last-week-schedule="onLastWeekSchedule" 
    />
    <div>{{ testData }}</div>
  </div>
</template>

<script>
import Schedule from "./components/Schedule.vue"
import gql from 'graphql-tag'

var dummy_json = `{
  "available": [
    {
      "start": "2020-07-17T10:30:00Z",
      "end": "2020-07-17T11:00:00Z"
    },
    {
      "start": "2020-07-17T13:00:00Z",
      "end": "2020-07-17T14:00:00Z"
    },
    {
      "start": "2020-07-18T05:30:00Z",
      "end": "2020-07-18T07:00:00Z"
    }
  ],
  "booked": [
    {
      "start": "2020-07-17T11:00:00Z",
      "end": "2020-07-17T13:00:00Z"
    },
    {
      "start": "2020-07-17T14:00:00Z",
      "end": "2020-07-17T15:00:00Z"
    },
    {
      "start": "2020-07-18T07:00:00Z",
      "end": "2020-07-18T08:00:00Z"
    },
    {
      "start": "2020-07-18T11:30:00Z",
      "end": "2020-07-18T13:00:00Z"
    }
  ]
}`;

export default {
  name: "App",
  components: {
    Schedule,
  },
  data() {
    return {
      scheduleDatas: {},
      testData: {}
    };
  },
  created: function () {

    // dummy data is at 2020/7/17
    const today = new Date(2020, 6, 17);
    this.getScheduleDatas(today);
  },
  methods: {
    onNextWeekSchedule(startedDate) {
      
      const isNeedToChangeDataForShowOff = true;
      
      startedDate.setDate(startedDate.getDate() + 1);
      
      this.getScheduleDatas(startedDate, isNeedToChangeDataForShowOff);
    },
    onLastWeekSchedule(startedDate) {
      
      const isNeedToChangeDataForShowOff = true;
      
      startedDate.setDate(startedDate.getDate() - 6);
      
      this.getScheduleDatas(startedDate, isNeedToChangeDataForShowOff);
    },
    getScheduleDatas(startedDate, isNeedToChangeDataForShowOff) {
      const started_at = startedDate.toISOString();
      this.axios
        .get(
          `http://localhost:8080/v1/guest/teachers/amy-estrada/schedule?started_at=${started_at}`
        )
        .then(function(response) {
          
          // normal
          response.data.standardDate = startedDate;
          this.scheduleDatas = response.data;
        })
        .catch((error) => {
          console.log(error);

          // use dummy data for test
          const data = JSON.parse(dummy_json);

          data.standardDate = startedDate;
          
          // this is for show off data is updated
          if (isNeedToChangeDataForShowOff) {
            const { available, booked } = data;
            data.available = booked;
            data.booked = available;
          }

          this.scheduleDatas = data;
        });
    }
  },
  apollo: {
    testData: gql`
      query {
        schedule
      }
    `,
  },
};

</script>

<style>
</style>
