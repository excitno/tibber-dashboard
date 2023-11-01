import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Axios from 'axios'

const TIBBER_API_URL: string = "https://api.tibber.com/v1-beta/gql"
const TIBBER_HOME_ID: string = process.env.TIBBER_HOME_ID || ""
const liveSubscriptionQuery = `subscription{ liveMeasurement(homeId:'${TIBBER_HOME_ID}'){ timestamp power accumulatedConsumption accumulatedCost currency minPower averagePower maxPower } }`

export const useTibberStore = defineStore('tibber', () => {
    // Graph QL queries
    


})