import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "./store"

// defines HOW every API request should be sent.
const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const auth = (getState() as RootState).auth
        if (auth?.accessToken) {
            headers.set("Authorization", `Bearer ${auth.accessToken}`)
        }
        return headers
    }
})

const apiClient = createApi({
    reducerPath: "api",
    baseQuery,
    refetchOnMountOrArgChange: true,
    tagTypes: ["transactions", "analytics", "billingSubscriptions"],
    endpoints: () => ({})
})

export { baseQuery, apiClient }

/*
Component calls query
↓
apiClient handles query
↓
apiClient uses baseQuery
↓
baseQuery attaches token/cookies
↓
request sent to backend
↓
response cached in Redux
*/