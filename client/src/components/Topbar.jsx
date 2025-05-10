import React from "react";
import { Layout, Typography, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

const Topbar = () => {
  let name = localStorage.getItem("user")
  return (
    <Header
      style={{
        background: "#001529",
        padding: "0 20px",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
      }}
    >
      <Title level={3} style={{ color: "white", margin: 0 }}>
        CCMS
      </Title>


      <Avatar style={{ backgroundColor: '#1890ff' }}>{name?.charAt(0)}</Avatar>
    </Header>
  );
};

export default Topbar;
