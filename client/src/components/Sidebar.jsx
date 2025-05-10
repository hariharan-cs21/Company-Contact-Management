import React, { useEffect, useState } from "react";
import { Layout, Menu, message, Spin } from "antd";
import { MonitorOutlined, UserOutlined, LogoutOutlined, FileDoneOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../constant";
import apiClient from "../apiClient";

const { Sider } = Layout;

const Sidebar = () => {
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await apiClient.get(API_ENDPOINTS.SESSION);
                setUserType(response.data.user.type);
            } catch (error) {
                message.error("Failed to fetch user session");
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    const handleLogout = async () => {
        try {
            await apiClient.post(API_ENDPOINTS.LOGOUT);
            message.success("Logged out successfully!");
            navigate("/");
        } catch (error) {
            message.error(error.response?.data?.message || "Logout failed");
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <Sider theme="dark" collapsible>
            <div style={{ paddingTop: "50px" }}>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>

                    {userType === "recruiter" && (
                        <>
                            <Menu.Item key="2" icon={<FileDoneOutlined />}>
                                <Link to="/recruiter">Dashboard</Link>
                            </Menu.Item>

                        </>
                    )}

                    {userType === "student" && (
                        <>
                            <Menu.Item key="4" icon={<FileDoneOutlined />}>
                                <Link to="/students">My Applications</Link>
                            </Menu.Item>
                            <Menu.Item key="5" icon={<UserOutlined />}>
                                <Link to="/student/profile">Profile</Link>
                            </Menu.Item>
                        </>
                    )}

                    {userType === "placement_coordinator" && (
                        <>
                            <Menu.Item key="6" icon={<FileDoneOutlined />}>
                                <Link to="/placement">Job </Link>
                            </Menu.Item>
                            <Menu.Item key="7" icon={<UserOutlined />}>
                                <Link to="/placement/view-applications">Manage Application</Link>
                            </Menu.Item>
                            <Menu.Item key="8" icon={<MonitorOutlined />}>
                                <Link to="/placement/detailed-view">Manage Students</Link>
                            </Menu.Item>
                        </>
                    )}
                </Menu>
            </div>

            <div style={{ position: "absolute", bottom: "10%", width: "100%" }}>
                <Menu theme="dark" mode="inline">
                    <Menu.Item
                        key="logout"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ backgroundColor: "#ff4d4f", color: "white", textAlign: "center" }}
                    >
                        Logout
                    </Menu.Item>
                </Menu>
            </div>
        </Sider>
    );
};

export default Sidebar;
