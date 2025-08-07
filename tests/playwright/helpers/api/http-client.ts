import axios, { AxiosInstance } from 'axios'
import https from 'https'

export function generateApiClient(apiUrl: string, windowId?: string): AxiosInstance {
    const apiClient = axios.create({
        baseURL: apiUrl,
        headers: {
            'X-Window-Id': windowId,
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false, // Allows self-signed/invalid SSL certs
        }),
    })

    // Enable logging if DEBUG is set
    if (process.env.DEBUG) {
        this.apiClient.interceptors.request.use((request) => {
            console.log('Starting Request', request)
            return request
        })
        this.apiClient.interceptors.response.use(
            (response) => {
                console.log('Response:', response)
                return response
            },
            (error) => {
                console.error('Error Response:', error.response)
                return Promise.reject(error)
            },
        )
    }

    return apiClient
}
