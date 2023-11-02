import { defineStore } from 'pinia'
import Axios from 'axios'
import { createClient, type ExecutionResult } from 'graphql-ws';

export interface DataState {
    homeId: string;
    log: LogItem[]
}

export interface LogItem {
    timestamp: string;
    power: number;
}

export const useDataStore = defineStore('data', {
    state: () => ({ homeId: "", log: [{ timestamp: "", power: 0.00}]}),
    getters: {
        getApiKey(): string {
            return import.meta.env.VITE_TIBBER_API_KEY || ""
        },
        getQueryApiUrl(): string {
            return "https://api.tibber.com/v1-beta/gql"
        }
    },
    actions: {
        /**
         * Populates the home ID by making a request to the Tibber API.
         * @returns A Promise that resolves when the home ID has been successfully populated.
         */
        async getHomeId(): Promise<string> {
            const apiUrl = this.getQueryApiUrl
            const homeIdQuery = `{viewer {homes {id}}}`
            const apiKey = this.getApiKey
            
            const request = await Axios.post(apiUrl, { query: homeIdQuery }, { headers: { Authorization: `Bearer ${apiKey}` } })
                .then(response => {
                    const homeId = response.data.data.viewer.homes[0].id
                    this.homeId = homeId
                    return homeId
                })
                .catch(error => console.log(error))
            return request
        },
        /**
         * Retrieves the websocket subscription URL for the current user from the Tibber API.
         * @returns A Promise that resolves to a string representing the websocket subscription URL.
         */
        async getWebsocketSubscriptionUrl(): Promise<string> {
            const apiUrl = this.getQueryApiUrl
            const wsSubUrlQuery =`{viewer { websocketSubscriptionUrl}}`
            const apiKey = this.getApiKey
            
            const request = await Axios.post(apiUrl, { query: wsSubUrlQuery }, { headers: { Authorization: `Bearer ${apiKey}` } })
                .then(response => {
                    return response.data.data.viewer.websocketSubscriptionUrl
                })
                .catch(error => console.log(error))
            return request
        },
        /**
         * Subscribes to live measurement data for a specific home using GraphQL websocket subscription.
         * @param homeId The home ID to subscribe to.
         * @returns void
         */
        async subscribeToLiveMeasurement(homeId: string, apiUrl: string) {
            const apiKey = this.getApiKey

            const client = createClient({
                url: apiUrl,
                lazy: false,
                connectionParams: () => ({
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }),
            })

            const subscription = `subscription {
                liveMeasurement(homeId: "${homeId}") {
                    timestamp
                    power
                }
            }`

            client.subscribe({ query: subscription }, {
                next: (data: ExecutionResult<{ liveMeasurement: { timestamp: string, power: number } }, Record<string, unknown>>) => {
                    const measurement = data?.data?.liveMeasurement;
                    if (measurement) {
                        this.log.push(measurement);
                    }
                },
                error: (error: unknown) => {
                    console.log(error);
                },
                complete: () => {
                    console.log('Subscription completed');
                }
            })
        },
        /**
         * Returns an array of LogItem objects representing the log.
         * @returns {LogItem[]} An array of LogItem objects representing the log.
         */
        getLog(): LogItem[] {
            return this.log
        },
        /**
         * Returns the latest measurement from the log.
         * @returns {LogItem} The latest measurement as a LogItem object.
         */
        getLatestMeasurement(): LogItem {
            return this.log[this.log.length - 1]
        },
        /**
         * Returns the latest power measurement.
         * @returns The latest power measurement.
         */
        getLatestPower(): number {
            return this.getLatestMeasurement().power
        }
    }
})