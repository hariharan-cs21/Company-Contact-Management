import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Form, Input, Select, message, DatePicker } from "antd";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import {
  useJobs,
  useGetApplications,
  useScheduleInterview,
  useUpdateInterviewStatus,
  useGetInterviewByApplication,
  useAddJob,
  useScheduleAllInterviews,
  useCloseJob,
  useSelectCandidate,
  useGetSelectedStudents
} from "./hooks/use-recuriter";

const { Content } = Layout;

const RecruitersDashboard = () => {
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);
  const { mutate: addJob } = useAddJob();
  const { mutate: closeJob } = useCloseJob();
  const { mutate: selectCandidate } = useSelectCandidate();

  const handleSelectCandidate = (jobId, userId) => {
    selectCandidate({ jobId, userId });
  };

  const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [scheduleModal, setScheduleModal] = useState({ visible: false, applicationId: null });
  const [scheduleAllModal, setScheduleAllModal] = useState({ visible: false, jobId: null });

  const [updateModal, setUpdateModal] = useState({ visible: false, applicationId: null });
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [status, setStatus] = useState("");

  const [roundName, setRoundName] = useState("");
  const [scheduledAt, setScheduledAt] = useState(null);
  const [mode, setMode] = useState("online");
  const [interviewer, setInterviewer] = useState("");

  const [jobForm] = Form.useForm();
  const [interviewForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const { data: selectedStudents } = useGetSelectedStudents();

  const { data: jobs } = useJobs();
  const { data: applications, refetch: refetchApplications } = useGetApplications(selectedJobId);
  const { mutate: scheduleInterview } = useScheduleInterview();
  const { mutate: updateInterviewStatus } = useUpdateInterviewStatus();
  const { mutate: scheduleAllInterviews } = useScheduleAllInterviews();

  // Open Applications Modal
  const showApplications = async (jobId) => {
    setSelectedJobId(jobId);
    setIsApplicationModalVisible(true);
    refetchApplications();
  };

  // Open Schedule Interview Modal
  const openScheduleModal = (applicationId) => {
    setScheduleModal({ visible: true, applicationId });
  };
  const openScheduleAllModal = (jobId) => {
    setScheduleAllModal({ visible: true, jobId });
  };

  const handleCloseJob = (jobId) => {
    Modal.confirm({
      title: "Are you sure you want to close this job?",
      content: "Closing this job will prevent further applications.",
      onOk: () => {
        closeJob(jobId);
      },
    });
  };
  // Schedule Interview Submission
  const handleScheduleAllInterviews = () => {
    if (!scheduledAt || !interviewer) {
      message.error("Please fill all fields.");
      return;
    }

    scheduleAllInterviews({
      jobId: scheduleAllModal.jobId,
      roundName,
      scheduledAt,
      mode,
      interviewer,
    });

    message.success("All interviews scheduled successfully!");
    scheduleAllForm.resetFields();
    setScheduleAllModal({ visible: false, jobId: null });
  };
  const handleScheduleInterview = () => {
    if (!roundName || !scheduledAt || !interviewer) {
      message.error("Please fill all fields.");
      return;
    }

    scheduleInterview({
      applicationId: scheduleModal.applicationId,
      roundName,
      scheduledAt,
      mode,
      interviewer,
    });

    message.success("Interview Scheduled!");
    interviewForm.resetFields();
    setScheduleModal({ visible: false, applicationId: null });
  };
  const { data: interviewData, refetch } = useGetInterviewByApplication(updateModal.applicationId);

  // Open Update Interview Status Modal & Fetch Rounds
  const openUpdateModal = (applicationId) => {
    setUpdateModal({ visible: true, applicationId });
    refetch(); // 🔥 Fetch interview rounds when opening modal
  };
  const handleAddJob = () => {
    jobForm.validateFields().then((values) => {
      addJob(values);
      message.success("Job posted successfully!");
      jobForm.resetFields();
      setIsJobModalVisible(false);
    });
  };
  // Update Interview Status Submission
  const handleUpdateInterviewStatus = () => {
    console.log(selectedRound)
    if (selectedRound === null || !status) {
      message.error("Please select a round and status.");
      return;
    }

    updateInterviewStatus({
      applicationId: updateModal.applicationId,
      round: selectedRound,
      status: status,
    });

    message.success("Interview status updated successfully!");
    setUpdateModal({ visible: false, applicationId: null });
  };


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin: "20px", padding: "20px", background: "#fff" }}>
          <h2>Job Postings</h2>
          <Button type="primary" onClick={() => setIsJobModalVisible(true)} style={{ marginBottom: "20px" }}>
            Post a Job
          </Button>
          <Table
            columns={[
              { title: "Job Title", dataIndex: "title", key: "title" },
              { title: "Company", dataIndex: "company", key: "company" },
              { title: "Location", dataIndex: "location", key: "location" },
              { title: "Salary", dataIndex: "salary", key: "salary" },
              {
                title: "Actions",
                key: "actions",
                render: (_, record) => (
                  <>
                    {record.status !== "closed" &&
                      <>
                        <Button type="link" onClick={() => showApplications(record._id)}>
                          View Applications
                        </Button>
                        <Button type="default" onClick={() => openScheduleAllModal(record._id)} style={{ marginLeft: 10 }}>
                          Schedule All Interviews
                        </Button>
                      </>
                    }
                    <Button
                      type="danger"
                      onClick={() => handleCloseJob(record._id)}
                      style={{ marginLeft: 10 }}
                      disabled={record.status === "closed"}
                    >
                      <span style={{ color: record.status === "closed" ? "red" : "blue" }}>
                        {record.status === "closed" ? "Closed" : "Close Job"}
                      </span>
                    </Button>
                  </>
                ),
              },
            ]}
            dataSource={jobs?.data || []}
            rowKey="_id"
          />
          <Modal title="Post a Job" open={isJobModalVisible} onOk={handleAddJob} onCancel={() => setIsJobModalVisible(false)}>
            <Form form={jobForm} layout="vertical">
              <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="company" label="Company Name">
                <Input defaultValue="" />
              </Form.Item>
              <Form.Item name="description" label="Job Description" rules={[{ required: true }]}>
                <Input.TextArea />
              </Form.Item>
              <Form.Item name="skills" label="Required Skills" rules={[{ required: true }]}>
                <Input placeholder="React, Node.js, MongoDB" />
              </Form.Item>
              <Form.Item name="batch" label="Batch">
                <Input placeholder="2024" />
              </Form.Item>
              <Form.Item name="location" label="Location">
                <Input />
              </Form.Item>
              <Form.Item name="cycle" label="Cycle of Visit">
                <Input />
              </Form.Item>
              <Form.Item name="deadline" label="Application Deadline">
                <Input type="date" />
              </Form.Item>
              <Form.Item name="degree" label="Eligible Degree/Branch">
                <Input />
              </Form.Item>
              <Form.Item name="salary" label="Salary Range">
                <Input placeholder="₹70,000 - ₹90,000" />
              </Form.Item>
              <Form.Item name="certifications" label="Certifications">
                <Input />
              </Form.Item>
              <Form.Item name="cgpa" label="Minimum CGPA Requirement">
                <Input type="number" min={0} max={10} step={0.1} placeholder="7.5" />
              </Form.Item>
            </Form>
          </Modal>
          {/* View Applications Modal */}
          <Modal
            title="Job Applications"
            open={isApplicationModalVisible}
            onCancel={() => setIsApplicationModalVisible(false)}
            footer={null}
            width={900}
          >
            <Table
              columns={[
                { title: "Candidate Name", dataIndex: ["user", "fullName"], key: "name" },
                { title: "Email", dataIndex: ["user", "email"], key: "email" },
                { title: "CGPA", dataIndex: ["user", "cgpa"], key: "cgpa" },
                {
                  title: "Actions",
                  key: "actions",
                  render: (_, record) => (
                    <>
                      <Button type="primary" onClick={() => openScheduleModal(record._id)}>
                        Schedule Interview
                      </Button>

                      <Button onClick={() => openUpdateModal(record._id)}>Update Status</Button>
                      {selectedStudents?.data?.data?.some((s) => s.userId._id === record.user._id) ? (
                        <Button type="default" disabled style={{ marginLeft: 10, color: "green" }}>
                          Selected ✅
                        </Button>
                      ) : (
                        <Button
                          type="default"
                          onClick={() => handleSelectCandidate(selectedJobId, record.user._id)}
                          style={{ marginLeft: 10 }}
                        >
                          Mark as Selected
                        </Button>
                      )}
                    </>
                  ),
                },
              ]}
              dataSource={applications?.data || []}
              rowKey="_id"
            />
          </Modal>
          {/* Schedule All Interviews Modal */}
          <Modal
            title="Schedule All Interviews"
            open={scheduleAllModal.visible}
            onOk={handleScheduleAllInterviews}
            onCancel={() => setScheduleAllModal({ visible: false, jobId: null })}
          >
            <Form form={interviewForm} layout="vertical">
              <Form.Item label="Round Name" name="roundName" rules={[{ required: true, message: "Round name is required" }]}>
                <Input onChange={(e) => setRoundName(e.target.value)} />
              </Form.Item>
              <Form.Item label="Scheduled At" name="scheduledAt" rules={[{ required: true, message: "Please select a date and time" }]}>
                <DatePicker showTime onChange={(date, dateString) => setScheduledAt(dateString)} />
              </Form.Item>
              <Form.Item label="Mode" name="mode" initialValue="online">
                <Select defaultValue="online" onChange={(value) => setMode(value)}>
                  <Select.Option value="online">Online</Select.Option>
                  <Select.Option value="offline">Offline</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Interviewer" name="interviewer" rules={[{ required: true, message: "Interviewer is required" }]}>
                <Input onChange={(e) => setInterviewer(e.target.value)} />
              </Form.Item>
            </Form>
          </Modal>

          {/* Schedule Interview Modal */}
          <Modal
            title="Schedule Interview"
            open={scheduleModal.visible}
            onOk={handleScheduleInterview}
            onCancel={() => setScheduleModal({ visible: false, applicationId: null })}
          >
            <Form form={interviewForm} layout="vertical">
              <Form.Item label="Round Name">
                <Input onChange={(e) => setRoundName(e.target.value)} />
              </Form.Item>
              <Form.Item label="Scheduled At">
                <DatePicker showTime onChange={(date, dateString) => setScheduledAt(dateString)} />
              </Form.Item>
              <Form.Item label="Mode">
                <Select defaultValue="online" onChange={(value) => setMode(value)}>
                  <Select.Option value="online">Online</Select.Option>
                  <Select.Option value="offline">Offline</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Interviewer">
                <Input onChange={(e) => setInterviewer(e.target.value)} />
              </Form.Item>
            </Form>
          </Modal>

          {/* Update Interview Status Modal */}
          <Modal
            title="Update Interview Status"
            open={updateModal.visible}
            onOk={handleUpdateInterviewStatus}
            onCancel={() => setUpdateModal({ visible: false, applicationId: null })}
          >
            <Form form={statusForm} layout="vertical">
              <Form.Item label="Select Interview Round">
                <Select onChange={(value) => setSelectedRound(value)}>
                  {interviewData?.rounds?.map((round, index) => (
                    <Select.Option key={index} value={index}>
                      {index + 1}. {round.roundName} - {round.status}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Select Status">
                <Select onChange={(value) => setStatus(value)}>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                  <Select.Option value="rescheduled">Rescheduled</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default RecruitersDashboard;
