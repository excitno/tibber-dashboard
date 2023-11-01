import { defineStore } from 'pinia'
import Axios from 'axios'
import { WebSocket } from 'ws'

export interface DataState {
    homeId: string;
    log: {
        timestamp: string;
        power: number;
    }[];
}

export const useDataStore = defineStore('data', {
    state: () => ({ homeId: "", log: [ { timestamp: "", power: 0 } ]}),
    getters: {
        getHomeId(): string {
            return this.homeId
        },
        getApiKey(): string {
            return import.meta.env.TIBBER_API_KEY;
        },
        getApiUrl(): string {
            return "api.tibber.com/v1-beta/gql"
        }
    },
    setters: {
        appendToLog(data: DataState) {
            this.log.push(data)
        }
    },
    actions: {
        /**
         * Populates the home ID by making a GraphQL API request to the Tibber API.
         * Sets the home ID on the store instance.
         */
        populateHomeId() {
            const apiUrl = this.getApiUrl
            const homeIdQuery = `{
                viewer {
                  homes {
                      id
                  }
                }
              }`
            const apiKey = this.getApiKey
            
            Axios.post(`https://${apiUrl}`, { query: homeIdQuery }, { headers: { Authorization: `Bearer ${apiKey}` } })
                .then(response => {
                    const homeId = response.data.data.viewer.homes[0].id
                    this.homeId = homeId
                })
                .catch(error => console.log(error))
        },
        /**
         * Subscribes to live measurement data for a specific home using GraphQL websocket subscription.
         * @param homeId The home ID to subscribe to.
         * @returns void
         */
        subscribeToLiveMeasurement(homeId: string) {
            const apiUrl = this.getApiUrl
            const apiKey = this.getApiKey
            const liveSubscriptionQuery = `subscription{ liveMeasurement(homeId:'${homeId}'){ timestamp power } }}`
            // graph QL websocket subscription
            const ws = new WebSocket(`wss://${apiUrl}`, `graphql-ws`)
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: `connection_init`, payload: { Authorization: `Bearer ${apiKey}` } }))
                ws.send(JSON.stringify({ type: `start`, payload: { query: liveSubscriptionQuery } }))
            }
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.type === `data`) {
                    const measurement = data.payload.data.liveMeasurement
                    this.appendToLog(measurement)
                }
            }
        }
    },
    methods: {
        getLog(): DataState[] {
            return this.log
        },
        getLatestMeasurement(): DataState {
            return this.log[this.log.length - 1]
        },
        getLatestPower(): number {
            return this.getLatestMeasurement().power
        },
        getLatestAccumulatedConsumption(): number {
            return this.getLatestMeasurement().accumulatedConsumption
        }
    }
})