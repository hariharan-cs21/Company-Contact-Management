import { useEffect } from "react";
import { Form, Input, Button, Card, Row, Col, Image, message } from "antd";
import { useNavigate } from "react-router-dom";
import img from "../assets/logo.png";
import API_ENDPOINTS from "../constant";
import apiClient from "../apiClient";

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await apiClient.get(API_ENDPOINTS.SESSION);

                if (response.data.loggedIn) {
                    message.success(
                        <span>
                            Welcome, <strong style={{ color: "#1890ff" }}>{response.data.user.name}</strong>! <br />
                            Redirecting to dashboard...
                        </span>
                    );
                    redirectUser(response.data.user.type);
                }
            } catch (error) {
                console.error("Session check failed:", error);
            }
        };

        checkSession();
    }, []);

    const onLogin = async (values) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.LOGIN, values);
            const user = response.data;
            console.log(user)

            if (user.passwordSet === false) {
                message.warning("You need to set your password before logging in.");
                localStorage.setItem("email", user.email);
                navigate("/set-password");
                return;
            }
            localStorage.setItem("id", user.user.id)
            localStorage.setItem("user", user.user.name)
            localStorage.setItem("email", user.user.email)

            message.success("Login successful!");
            redirectUser(user.user.type);

        } catch (error) {
            message.error(error.response?.data?.message || "Login failed. Try again!");
        }
    };

    const redirectUser = (userType) => {
        switch (userType) {
            case "recruiter":
                navigate("/recruiter");
                break;
            case "student":
                navigate("/students");
                break;
            case "placement_coordinator":
                navigate("/placement");
                break;
            default:
                navigate("/");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Card style={{ width: 350, padding: 20 }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <Image src={img} alt="Logo" preview={false} />
                </div>

                <Form name="login" onFinish={onLogin} layout="vertical">
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Please enter your email!" }]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please enter your password!" }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Login
                        </Button>
                    </Form.Item>

                    <Row justify="center">
                        <Col>
                            <Button type="link" onClick={() => navigate("/register")}>
                                Don't have an account? Sign up
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
