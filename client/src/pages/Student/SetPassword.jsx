import { useEffect, useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../../constant";
import apiClient from "../../apiClient";

const SetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            message.error("No email found. Redirecting to login.");
            navigate("/login");
        }
    }, [navigate]);

    const onSetPassword = async (values) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.SET_PASSWORD, {
                email,
                password: values.password,
            });

            if (response.status === 200) {
                message.success("Password set successfully! Please log in.");
                localStorage.removeItem("email");
                navigate("/");
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to set password. Try again!");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Card style={{ width: 400, padding: 20 }}>
                <h2 style={{ textAlign: "center" }}>Set Your Password</h2>

                <Form name="set-password" onFinish={onSetPassword} layout="vertical">
                    <Form.Item label="Email">
                        <Input value={email} disabled />
                    </Form.Item>

                    <Form.Item
                        label="New Password"
                        name="password"
                        rules={[
                            { required: true, message: "Please enter a password!" },
                            { min: 6, message: "Password must be at least 6 characters long!" },
                        ]}
                    >
                        <Input.Password placeholder="Enter your new password" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Please confirm your password!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm your new password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Set Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SetPassword;
