// Fetch analytics data from backend with automatic caching and refetching.

import { apiClient } from "../../app/api-client";
import type { ChartAnalyticsResponse, ExpensePieChartBreakdownResponse, FilterParams, SummaryAnalyticsResponse } from "./anayticsType";

export const analyticsApi = apiClient.injectEndpoints({
    endpoints: (builder) => (
    {
        summaryAnalytics: builder.query<SummaryAnalyticsResponse, FilterParams>({
                query: ({preset, from, to}) => (
                {
                    url: "/analytics/summary",
                    method: "GET",
                    params: {preset, from, to}
                }
            ),
            providesTags: ["analytics"],
        }
    ),
    chartAnalytics: builder.query<ChartAnalyticsResponse, FilterParams>({
            query: ({preset, from, to}) => (
                {
                    url: "/analytics/chart",
                    method: "GET",
                    params: {preset, from, to}
                }
            ),
            providesTags: ["analytics"],
        }
    ),
    expensePieChartBreakdown: builder.query<ExpensePieChartBreakdownResponse, FilterParams  >({
        query: ({preset, from, to}) => (
            {
                url: "/analytics/expenceBreakdown",
                method: "GET",
                params: {preset, from, to}
            }
        ),
        providesTags: ["analytics"],
    }),
  }),
});

export const {
  useSummaryAnalyticsQuery,
  useChartAnalyticsQuery,
  useExpensePieChartBreakdownQuery,
} = analyticsApi;