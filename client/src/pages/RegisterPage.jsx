import { Form, Input, Button, Select, Card, Row, Col, Image, message } from "antd";
import { useNavigate } from "react-router-dom";
import img from "../assets/logo.png";
import API_ENDPOINTS from "../constant";
import apiClient from "../apiClient";

const { Option } = Select;

const Registration = () => {
    const navigate = useNavigate();

    const onRegister = async (values) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.REGISTER, values);

            if (response.status === 201) {
                message.success("Registration successful! Redirecting to login...");
                setTimeout(() => navigate("/"), 2000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            message.error(error.response?.data?.message || "Registration failed. Try again!");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Card style={{ width: 400, padding: 20 }}>
                <div>
                    <Image src={img} alt="Logo" preview={false} />
                </div>
                <Form name="register" onFinish={onRegister} layout="vertical">
                    <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[{ required: true, message: "Please enter your full name!" }]}
                    >
                        <Input placeholder="Enter your full name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, min: 6, message: "Password must be at least 6 characters!" }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>

                    <Form.Item
                        label="User Type"
                        name="userType"
                        rules={[{ required: true, message: "Please select your user type!" }]}
                    >
                        <Select placeholder="Select user type">
                            <Option value="student">Student</Option>
                            <Option value="recruiter">Recruiter</Option>
                            <Option value="placement_coordinator">Placement Coordinator</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Register
                        </Button>
                    </Form.Item>

                    <Row justify="center">
                        <Col>
                            <Button type="link" onClick={() => navigate("/")}>
                                Already have an account? Login
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default Registration;
