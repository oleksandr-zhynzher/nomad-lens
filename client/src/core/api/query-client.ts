import { reportClientError } from "@core/utils";
import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      reportClientError(error, {
        source: "tanstack-query",
        metadata: {
          queryHash: query.queryHash,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30 * 60 * 1000,
    },
  },
});
