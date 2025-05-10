import React, { useEffect, useState } from "react";
import { Layout, Card, Input, Form, Button, message, Spin, Modal, Typography, Avatar, Space, Divider } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, MailOutlined, LinkedinOutlined, FileTextOutlined, PhoneOutlined } from "@ant-design/icons";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import API_ENDPOINTS from "../../constant";
import apiClient from "../../apiClient";

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [profile, setProfile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const userEmail = localStorage.getItem("email");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userEmail) {
                message.error("User email not found.");
                setLoading(false);
                return;
            }

            try {
                const response = await apiClient.get(API_ENDPOINTS.GET_PROFILE(userEmail));
                setProfile(response.data);
                form.setFieldsValue(response.data);
            } catch (error) {
                message.error(error.response?.data?.message || "Failed to fetch profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userEmail, form]);

    const handleUpdate = async (values) => {
        setUpdating(true);

        if (typeof values.skills === "string") {
            values.skills = values.skills.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);
        }


        try {
            const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, {
                email: userEmail,
                ...values,
            });

            setProfile(response.data.user);
            message.success("Profile updated successfully!");
            setIsModalVisible(false);
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Spin size="large" style={{ display: "block", margin: "20% auto" }} />;

    return (
        <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
            <Sidebar />
            <Layout>
                <Topbar />
                <Content style={{ padding: "40px", display: "flex", justifyContent: "center" }}>

                    {/* Profile Card */}
                    <Card
                        style={{
                            width: "100%",
                            maxWidth: "700px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            padding: "20px",
                            background: "white"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "20px", paddingBottom: "20px" }}>
                            <Avatar size={80} style={{ backgroundColor: "#1890ff" }} icon={<UserOutlined />} />
                            <div>
                                <Title level={3} style={{ margin: 0 }}>{profile?.fullName || "User Name"}</Title>
                                <Text type="secondary">{profile?.email}</Text>
                            </div>
                        </div>

                        <Divider />

                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            <Text><MailOutlined /> <strong>Email:</strong> {profile?.email}</Text>
                            <Text><PhoneOutlined /> <strong>Contact:</strong> {profile?.contactNumber || "N/A"}</Text>
                            <Text><FileTextOutlined /> <strong>Branch:</strong> {profile?.branch || "N/A"}</Text>
                            <Text><FileTextOutlined /> <strong>CGPA:</strong> {profile?.cgpa || "N/A"}</Text>
                            <Text><FileTextOutlined /> <strong>Passing Year:</strong> {profile?.passingYear || "N/A"}</Text>
                            <Text><FileTextOutlined /> <strong>Skills:</strong> {profile?.skills?.join(", ") || "N/A"}</Text>
                            <Text><LinkedinOutlined /> <strong>LinkedIn:</strong> <a href={profile?.linkedinProfile} target="_blank" rel="noopener noreferrer">{profile?.linkedinProfile || "N/A"}</a></Text>
                        </Space>

                        <Divider />

                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            style={{ width: "100%", fontSize: "16px", height: "45px" }}
                        >
                            Edit Profile
                        </Button>
                    </Card>

                    {/* Edit Modal */}
                    <Modal
                        title="Edit Profile"
                        visible={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        footer={null}
                    >
                        <Form form={form} layout="vertical" onFinish={handleUpdate}>
                            <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Full Name is required!" }]}>
                                <Input prefix={<UserOutlined />} placeholder="Enter full name" />
                            </Form.Item>

                            <Form.Item label="Branch" name="branch">
                                <Input placeholder="Enter branch" />
                            </Form.Item>

                            <Form.Item label="Passing Year" name="passingYear">
                                <Input type="number" placeholder="Enter passing year" />
                            </Form.Item>

                            <Form.Item label="CGPA" name="cgpa">
                                <Input type="number" step="0.01" placeholder="Enter CGPA (0-10)" />
                            </Form.Item>

                            <Form.Item label="Skills" name="skills">
                                <Input placeholder="Enter skills (comma separated)" />
                            </Form.Item>

                            <Form.Item label="Contact Number" name="contactNumber">
                                <Input prefix={<PhoneOutlined />} placeholder="Enter contact number" />
                            </Form.Item>

                            <Form.Item label="LinkedIn Profile" name="linkedinProfile">
                                <Input prefix={<LinkedinOutlined />} placeholder="Enter LinkedIn URL" />
                            </Form.Item>

                            <Form.Item label="Resume Link" name="resumeLink">
                                <Input prefix={<FileTextOutlined />} placeholder="Enter resume link" />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={updating}
                                block
                            >
                                Save Changes
                            </Button>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Profile;
