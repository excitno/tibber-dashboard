import { defineStore } from 'pinia'
import Axios from 'axios'
import { v4 } from 'uuid'

export interface DataState {
    homeId: Home;
    log: LogItem[]
}

export interface LogItem {
    timestamp: string;
    power: number;
}

export interface Home {
    id: string;
    address: Address;
}

export interface Address {
    address1: string;
    postalCode: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
}

export const useDataStore = defineStore('data', {
    state: () => ({ 
        home: {
            id: "",
            address: { 
                address1: "", 
                postalCode: "", 
                city: "", 
                country: "", 
                latitude: 0,
                longtitude: 0
            }
        }, 
        log: [
            {
                timestamp: new Date().toISOString(),
                power: 5001
            }
        ]
    }),
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
         * Retrieves the home for the current user from the Tibber API.
         * @returns A Promise that resolves to a Home object.
         */
        async getHome(): Promise<Home> {
            const apiUrl = this.getQueryApiUrl
            const homeIdQuery = `{viewer {homes {id address {address1 postalCode city country latitude longitude }}}}`
            const apiKey = this.getApiKey

            const request = await Axios.post(apiUrl, { query: homeIdQuery }, { headers: { Authorization: `Bearer ${apiKey}` } })
                .then(response => {
                    const home = response.data.data.viewer.homes[0]
                    this.home = home
                    return home
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
            const wsSubUrlQuery = `{viewer { websocketSubscriptionUrl}}`
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
        async subscribeToLiveMeasurement(apiUrl: string) {
            const me = this
            const apiKey = this.getApiKey

            // Create a new websocket connection
            const ws = new WebSocket(apiUrl, "graphql-transport-ws")
            ws.binaryType = "arraybuffer"

            ws.addEventListener("open", () => {
                ws.send(JSON.stringify({
                    type: "connection_init",
                    payload: {
                        token: apiKey
                    }
                }))
            })

            // Handle incoming messages
            ws.addEventListener("message", (event) => {
                const data = JSON.parse(event.data)
                if (data.type === "next") {
                    const measurement: LogItem = data.payload.data.liveMeasurement
                    me.appendLogItem(measurement)
                } else if (data.type === "connection_ack") {
                    // When the server acknowledges the connection, send the subscription request
                    ws.send(JSON.stringify({
                        id: v4(),
                        type: "subscribe",
                        payload: {
                            query: `subscription {
                                liveMeasurement(homeId: "${me.home.id}") {
                                    timestamp
                                    power
                                }
                            }`,
                            variables: {},
                            extensions: {}
                        }
                    }))
                }
            })

            // Handle errors
            ws.addEventListener("error", (event) => {
                console.log(event)
            })

            // Handle completion
            ws.addEventListener("close", () => {
                console.log("Websocket connection closed.")
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
         * Appends a LogItem object to the log.
         * @param {LogItem} item The LogItem object to append to the log.
         * @returns void
         */
        appendLogItem(item: LogItem): void {
            this.log.push(item)
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
        },
        /**
         * Get last timestamp the power was above a certain threshold
         * @param threshold The threshold to check against.
         * @returns The last timestamp the power was above the threshold.
         */
        getLastTimestampAboveThreshold(threshold: number): Date | null {
            const log = this.getLog()
            const lastItem = log.slice().reverse().find(item => item.power > threshold)
            if (lastItem) {
                return new Date(lastItem.timestamp)
            } else {
                return null
            }
        }
    }
})
