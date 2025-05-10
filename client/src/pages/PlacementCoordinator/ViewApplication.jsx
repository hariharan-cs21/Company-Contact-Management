import { useState, useEffect } from "react";
import { Table, Button, Modal, Layout, Row, Col, Card, Spin, message } from "antd";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useGetJobs, useGetApplications, useReviewApplication } from "./hooks/use-placement-routes";
import axios from "axios";

const ViewApplications = () => {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [offeredStudents, setOfferedStudents] = useState([]); // Store offered students
  const [offeredLoading, setOfferedLoading] = useState(false);
  const [isOfferedModalVisible, setIsOfferedModalVisible] = useState(false);
  const [selectedOfferedJobId, setSelectedOfferedJobId] = useState(null);

  const { data: jobs, isLoading } = useGetJobs();
  const { data: applications, isLoading: applicationsLoading, refetch } = useGetApplications(selectedJobId);
  const { mutate: reviewApplication } = useReviewApplication();

  const handleViewApplication = (jobId) => {
    setSelectedJobId(jobId);
    setIsModalVisible(true);
  };

  const handleReview = (applicationId, action) => {
    reviewApplication(
      { applicationId, action },
      {
        onSuccess: () => {
          message.success(`Application ${action}d successfully`);
          refetch(); // Refresh applications after update
        },
        onError: () => {
          message.error(`Failed to ${action} application`);
        },
      }
    );
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleViewOfferedStudents = (jobId) => {
    setSelectedOfferedJobId(jobId);
    setIsOfferedModalVisible(true);
  };
  const handleCancelOffered = () => setIsOfferedModalVisible(false);
  const offeredColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },

    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
  ];
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      key: "coordinatorApproved",
      dataIndex: "coordinatorApproved",
      render: (coordinatorApproved, record) =>
        coordinatorApproved === true ? (
          <span style={{ fontWeight: "bold", color: "green" }}>Approved</span>
        ) : coordinatorApproved === false ? (
          <span style={{ fontWeight: "bold", color: "red" }}>Rejected</span>
        ) : (
          <>
            <Button type="primary" onClick={() => handleReview(record.key, "approve")} style={{ marginRight: "10px" }}>
              Approve
            </Button>
            <Button danger onClick={() => handleReview(record.key, "reject")}>
              Reject
            </Button>
          </>
        ),
    },
    {
      title: "View Profile",
      key: "viewProfile",
      render: (text, record) => (
        <Button type="link" href={`/profile/${record.key}`} target="_blank">
          View Profile
        </Button>
      ),
    },
  ];
  useEffect(() => {
    if (!selectedOfferedJobId) return;
    setOfferedLoading(true);
    axios
      .get(`http://localhost:8000/api/interview/selected-students/${selectedOfferedJobId}`)
      .then((response) => {
        setOfferedStudents(Array.isArray(response.data.data) ? response.data.data : []);
      })
      .catch((error) => {
        console.error("Error fetching offered students:", error);
      })
      .finally(() => setOfferedLoading(false));
  }, [selectedOfferedJobId]);
  const dataSource = applications?.data?.map((application) => ({
    key: application._id,
    name: application.user.fullName,
    coordinatorApproved: application.coordinatorApproved,
  }));
  const formattedOfferedStudents = offeredStudents.map(student => ({
    key: student._id,
    name: student.userId.fullName,
    branch: student.userId.branch,
    company: student.company,
  }));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Row gutter={[24, 24]} style={{ padding: "24px" }}>
          {jobs?.data?.map((job) => (
            <Col key={job._id} xs={24} sm={12} lg={8}>
              <Card
                title={job.title}
                hoverable
                style={{ height: "100%", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                extra={<span style={{ color: "#666", fontSize: "14px" }}>{job.company}</span>}
                actions={[
                  <Button
                    type="primary"
                    style={{ borderRadius: "6px", width: "80%", margin: "0 auto" }}
                    onClick={() => handleViewApplication(job._id)}
                  >
                    View Applications
                  </Button>,

                ]}
              >
                <Button type="default" onClick={() => handleViewOfferedStudents(job._id)}>View Offered Students</Button>,

                <div style={{ minHeight: "100px", padding: "8px 0", color: "rgba(0, 0, 0, 0.65)" }}>
                  <p style={{ marginBottom: "16px", fontSize: "14px", lineHeight: "1.5" }}>{job.description}</p>
                  <div style={{ fontSize: "14px" }}>
                    {job.skills && <p><strong>Skills Required:</strong> {job.skills}</p>}
                    {job.location && <p><strong>Location:</strong> {job.location}</p>}
                    {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
                    {job.deadline && <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <Modal title="Offered Students" open={isOfferedModalVisible} onCancel={handleCancelOffered} footer={null}>
          {offeredLoading ? <Spin /> : <Table dataSource={formattedOfferedStudents} columns={offeredColumns} pagination={false} />
          }
        </Modal>
        <Modal title="Applications" open={isModalVisible} onCancel={handleCancel} footer={null}>
          {applicationsLoading ? <Spin /> : <Table dataSource={dataSource} columns={columns} pagination={false} />}
        </Modal>
      </Layout>
    </Layout>
  );
};

export default ViewApplications;
