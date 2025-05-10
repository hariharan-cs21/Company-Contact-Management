import { Upload, Button, message, Card, Spin, Layout, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import apiClient from "../../apiClient";
import API_ENDPOINTS from "../../constant";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";

const { Content } = Layout;

const UploadStudent = () => {
  const [loading, setLoading] = useState(false);

  const props = {
    name: "file",
    accept: ".xls,.xlsx",
    showUploadList: false,
    beforeUpload: (file) => {
      const isExcel = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        message.error("You can only upload Excel files (.xls or .xlsx)!");
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await apiClient.post(API_ENDPOINTS.UPLOAD_STUDENTS, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        message.success(response.data.message);
        onSuccess("File uploaded successfully");
      } catch (error) {
        message.error(error.response?.data?.message || "File upload failed!");
        onError(error);
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ padding: 20 }}>
          <Row gutter={16} justify="center">
            <Col xs={24} md={8}>
              <Card title="Upload Student Data" style={{ textAlign: "center", padding: 20 }}>
                <Upload.Dragger {...props} disabled={loading} style={{ marginBottom: 20 }}>
                  {loading ? (
                    <Spin size="large" />
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: 40, color: "#1890ff" }} />
                      </p>
                      <p className="ant-upload-text">Click or drag an Excel file to upload</p>
                      <p className="ant-upload-hint">Only .xls and .xlsx files are supported</p>
                    </>
                  )}
                </Upload.Dragger>
                <Button type="primary" icon={<UploadOutlined />} disabled={loading} block>
                  Upload File
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Student Overview" style={{ textAlign: "center", padding: 20 }}>
                <p>Display student statistics or overview information here.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Recent Uploads" style={{ textAlign: "center", padding: 20 }}>
                <p>Show recently uploaded student files or logs.</p>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UploadStudent;
