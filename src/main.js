import Vue from 'vue'
import App from './App.vue'
import ApolloClient from 'apollo-boost'
import InMemoryCache from 'apollo-cache-inmemory'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueApollo from 'vue-apollo'
import VueI18n from 'vue-i18n'
import gql from 'graphql-tag';

Vue.config.productionTip = false

Vue.use(VueAxios, axios)
Vue.use(VueApollo)
Vue.use(VueI18n)

const messages = {
  ch: {
    message: {
      schedule: {
        title: '授課時間',
        // timezone is downloaded with https://th.amazingtalker.com/teachers-and-tutors/amy-estrada, then mapping zone and show value
        // 'time-zone-description': '* 時間以 {0} 顯示'
        'time-zone-description': '* 時間以 台北 (GMT+08:00) 顯示'
      }
    }
  },
  en: {
    message: {
      schedule: {
        title: 'Available times',
        // 'time-zone-description': '* All the timings listed are in your timezone: {0}' 
        'time-zone-description': '* All the timings listed are in your timezone: Taipei (GMT+08:00)' 
      }
    }
  }
}

const i18n = new VueI18n({
  locale: 'ch',
  messages
})

const cache = new InMemoryCache()

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }
`;
 
const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
})

cache.writeData({
  data: {
    schedule: [
      {
        __typename: 'Item',
        id: 'dqdBHJGgjgjg',
        text: 'test',
        done: true,
      },
    ],
  },
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

new Vue({
  i18n,
  apolloProvider: apolloProvider,
  render: h => h(App)
})
.$mount('#app')