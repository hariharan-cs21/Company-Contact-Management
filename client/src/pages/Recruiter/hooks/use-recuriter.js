import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "http://localhost:8000/api/jobs"; // Base API URL
const INTERVIEW_API_URL = "http://localhost:8000/api/interview";


export const useCloseJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId) => axios.patch(`${API_URL}/close-job/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      message.success("Job closed successfully!");
    },
  });
};
export const useGetSelectedStudents = () => {
  return useQuery({

    queryKey: ["selectedStudents"],
    queryFn: () => axios.get(`${INTERVIEW_API_URL}/selected-students`),
  });
};

export const useSelectCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, userId }) =>
      axios.post(`${INTERVIEW_API_URL}/select-student`, { jobId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      message.success("Candidate marked as selected!");
    },
  });
};

// ✅ Get all jobs
export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: () => axios.get(`${API_URL}/get-jobs`),
  });
};

// ✅ Add a new job (Recruiter)
export const useAddJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job) => axios.post(`${API_URL}/post-job`, job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

// ✅ Apply for a job (Student)
export const useApplyJob = () => {
  return useMutation({
    mutationFn: ({ userId, jobId }) => axios.post(`${API_URL}/apply-job`, { userId, jobId }),
  });
};

// ✅ Get applied jobs (Student)
export const useGetAppliedJobs = (userId) => {
  return useQuery({
    queryKey: ["applied-jobs", userId],
    queryFn: () => axios.get(`${API_URL}/applied-jobs/${userId}`),
    enabled: !!userId, // Ensures query runs only when userId is available
  });
};

// ✅ Get applications for a job (Recruiter)
export const useGetApplications = (jobId) => {
  return useQuery({
    queryKey: ["applications", jobId],
    queryFn: () => axios.get(`${API_URL}/get-applications/${jobId}`),
    enabled: !!jobId, // Ensures query runs only when jobId is set
  });
};

export const useGetInterviewByApplication = (applicationId) => {
  return useQuery({
    queryKey: ["interview", applicationId],
    queryFn: () => axios.get(`${INTERVIEW_API_URL}/application/${applicationId}`).then((res) => res.data),
    enabled: !!applicationId,
  });
};


// ✅ Schedule an interview
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, roundName, scheduledAt, mode, interviewer }) =>
      axios.post(`${INTERVIEW_API_URL}/schedule`, {
        applicationId,
        roundName,
        scheduledAt,
        mode,
        interviewer
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
};
export const useScheduleAllInterviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, roundName, scheduledAt, mode, interviewer }) =>
      axios.post(`${INTERVIEW_API_URL}/schedule-all/${jobId}`, {
        roundName,
        scheduledAt,
        mode,
        interviewer,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      message.success("Interviews scheduled for all applicants successfully!");
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Failed to schedule interviews.");
    },
  });
};

// ✅ Update interview round status
export const useUpdateInterviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, round, status }) => {
      // Step 1: Fetch the interview ID using the application ID
      const interviewResponse = await axios.get(`${INTERVIEW_API_URL}/application/${applicationId}`);
      const interview = interviewResponse.data;

      if (!interview || !interview._id) {
        throw new Error("Interview not found");
      }

      // Step 2: Update the interview round status
      return axios.patch(`${INTERVIEW_API_URL}/${interview._id}/round/${round}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
};
