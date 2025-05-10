import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, message, Spin } from "antd";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import apiClient from "../../apiClient";
import API_ENDPOINTS from "../../constant";
import axios from "axios";
const { Content } = Layout;

const StudentsDashboard = () => {
    const [isAppliedModalVisible, setIsAppliedModalVisible] = useState(false);
    const [jobs, setJobs] = useState([]); // All jobs
    const [filteredJobs, setFilteredJobs] = useState([]); // Jobs excluding applied ones
    const [appliedJobs, setAppliedJobs] = useState([]); // Jobs the student applied for
    const [interviewData, setInterviewData] = useState({}); // Stores interview rounds
    const [loading, setLoading] = useState(false);
    const [offeredJobs, setOfferedJobs] = useState([]);

    const studentId = localStorage.getItem("id");

    useEffect(() => {
        apiClient.get(API_ENDPOINTS.GET_JOBS)
            .then((response) => setJobs(response.data))
            .catch((error) => console.error("Error fetching jobs:", error));

        apiClient.get(API_ENDPOINTS.GET_APPLIED_JOBS(studentId))
            .then((response) => {
                setAppliedJobs(response.data);
            })
            .catch((error) => console.error("Error fetching applied jobs:", error));
    }, []);

    // ✅ Exclude applied jobs from available job listings
    useEffect(() => {
        const appliedJobIds = appliedJobs.map((job) => job.job._id);
        setFilteredJobs(jobs.filter((job) => !appliedJobIds.includes(job._id)));
    }, [jobs, appliedJobs]);
    useEffect(() => {
        if (!studentId) return;

        axios
            .get(`http://localhost:8000/api/interview/userSelected/${studentId}`)
            .then((response) => {
                if (response.data.success) {
                    setOfferedJobs(response.data.data);
                }
            })
            .catch((error) => {
                console.error("Error checking if student is selected:", error);
            });
    }, [studentId]);

    // ✅ Fetch interview rounds after appliedJobs are available
    useEffect(() => {
        const fetchInterviewRounds = async () => {
            setLoading(true);
            const interviewDataMap = {};

            for (const job of appliedJobs) {
                if (job._id) {
                    try {
                        const response = await apiClient.get(API_ENDPOINTS.GET_INTERVIEWS_BY_APPLICATION(job._id));
                        interviewDataMap[job._id] = response.data.rounds || [];
                    } catch (error) {
                        console.error("Error fetching interview rounds:", error);
                    }
                }
            }

            setInterviewData(interviewDataMap);
            setLoading(false);
        };

        fetchInterviewRounds();

    }, [appliedJobs]);

    const handleApplyJob = (jobId) => {
        apiClient.post(API_ENDPOINTS.APPLY_JOB, { jobId, userId: studentId })
            .then(() => {
                message.success("Job application submitted!");
                setAppliedJobs([...appliedJobs, { job: { _id: jobId }, coordinatorApproved: null }]);
            })
            .catch(() => message.error("Failed to apply for the job."));
    };

    const handleViewAppliedJobs = () => {
        setIsAppliedModalVisible(true);
    };

    const jobColumns = [
        { title: "Job Title", dataIndex: "title", key: "title" },
        { title: "Company", dataIndex: "company", key: "company" },
        { title: "Location", dataIndex: "location", key: "location" },
        { title: "Salary", dataIndex: "salary", key: "salary" },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => {
                const isApplied = appliedJobs.some((job) => job.job._id === record._id);
                return (
                    <Button type="primary" onClick={() => handleApplyJob(record._id)} disabled={isApplied}>
                        {isApplied ? "Applied" : "Apply"}
                    </Button>
                );
            },
        },
    ];

    const appliedJobColumns = [
        { title: "Job Title", dataIndex: ["job", "title"], key: "title" },
        { title: "Company", dataIndex: ["job", "company"], key: "company" },
        {
            title: "Coordinator Approval",
            dataIndex: "coordinatorApproved",
            key: "coordinatorApproved",
            render: (value) => {
                if (value === true) return <span style={{ color: "green" }}>Approved</span>;
                if (value === false) return <span style={{ color: "red" }}>Rejected (Contact Placement Cell)</span>;
                return <span style={{ color: "orange" }}>Pending Review</span>;
            },
        },
        {
            title: "Interview Rounds",
            key: "interviewRounds",
            render: (_, record) => {
                const rounds = interviewData[record._id] || [];
                if (loading) return <Spin />;
                return rounds.length > 0 ? (
                    <ul>
                        {rounds.map((round, index) => (
                            <li key={round._id}>
                                Round {index + 1}: {round.roundName} - {round.status} ({round.mode})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span>No interviews scheduled</span>
                );
            },
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar />
            <Layout>
                <Topbar />
                <Content style={{ margin: "20px", padding: "20px", background: "#fff" }}>
                    <h2>Available Jobs</h2>
                    <Table columns={jobColumns} dataSource={filteredJobs} rowKey="_id" />

                    <Button type="primary" style={{ marginTop: "20px" }} onClick={handleViewAppliedJobs}>
                        View Applied Jobs
                    </Button>

                    {/* Applied Jobs Modal */}
                    <Modal
                        title="Applied Jobs"
                        open={isAppliedModalVisible}
                        onCancel={() => setIsAppliedModalVisible(false)}
                        footer={null}
                        width={800} // Increased width
                    >
                        <Table columns={appliedJobColumns} dataSource={appliedJobs} rowKey="_id" />
                    </Modal>
                    {offeredJobs.length > 0 && (
                        <div style={{ marginTop: "20px" }}>
                            <h2>Job Offers</h2>
                            <Table
                                columns={[
                                    { title: "Company", dataIndex: "company", key: "company" },
                                    { title: "Job Title", dataIndex: ["jobId", "title"], key: "jobTitle" },
                                    {
                                        title: "Selection Date", dataIndex: "selectedAt", key: "selectedAt", render: (date) => new Date(date).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true
                                        })
                                    },
                                ]}
                                dataSource={offeredJobs}
                                rowKey="_id"
                            />
                        </div>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default StudentsDashboard;
