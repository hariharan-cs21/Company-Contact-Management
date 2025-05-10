const API_BASE_URL = "http://localhost:8000/api";

export const API_ENDPOINTS = {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    SESSION: `${API_BASE_URL}/auth/session`,
    SET_PASSWORD: `${API_BASE_URL}/auth/set-password`,
    UPLOAD_STUDENTS: `${API_BASE_URL}/auth/upload-students`,
    STUDENT_DATA: `${API_BASE_URL}/auth/getUserData`,
    GET_PROFILE: (email) => `${API_BASE_URL}/auth/profile?email=${email}`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
    //JOBS
    GET_JOBS: `${API_BASE_URL}/jobs/get-jobs`,
    APPLY_JOB: `${API_BASE_URL}/jobs/apply-job`,
    GET_APPLIED_JOBS: (userId) => `${API_BASE_URL}/jobs/applied-jobs/${userId}`,
    GET_APPLICATIONS: (jobId) => `${API_BASE_URL}/jobs/get-applications/${jobId}`,
    REVIEW_APPLICATION: (applicationId) => `${API_BASE_URL}/jobs/review-application/${applicationId}`,
    GET_INTERVIEWS_BY_APPLICATION: (applicationId) => `${API_BASE_URL}/interview/application/${applicationId}`,
    GET_OFFERED_STUDENTS: (jobId) => `${API_BASE_URL}/interview/selected-students/${jobId}`,
};

export default API_ENDPOINTS;
