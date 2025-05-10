import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import apiClient from "../../../apiClient";

import API_ENDPOINTS from "../../../constant";

export const useGetJobs = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.GET_JOBS],
    queryFn: () => apiClient.get(API_ENDPOINTS.GET_JOBS),
  });
};

export const useGetApplications = (jobId) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.GET_APPLICATIONS, jobId],
    queryFn: () => apiClient.get(API_ENDPOINTS.GET_APPLICATIONS(jobId)),
    enabled: !!jobId,
  });
};

export const useReviewApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, action }) => {
      const response = await apiClient.put(
        API_ENDPOINTS.REVIEW_APPLICATION(applicationId), // ✅ Use API_ENDPOINTS
        { action }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([API_ENDPOINTS.GET_APPLICATIONS]); // ✅ Ensure correct query key
    },
  });
};