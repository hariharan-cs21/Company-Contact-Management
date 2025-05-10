import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Layout,
  Row,
  Col,
  Spin,
} from "antd";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const columns = [
  {
    title: "Name",
    dataIndex: "fullName",
    key: "fullName",
  },
  {
    title: "CGPA",
    dataIndex: "cgpa",
    key: "cgpa",
  },
  {
    title: "Branch",
    dataIndex: "branch",
    key: "branch",
  },
  {
    title: "Offered Company / Status",
    key: "companyOrStatus",
    render: (text, record) =>
      record.placementStatus === "placed" ? record.company : record.placementStatus,
  },
];

const DetailedView = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState("");
  const [cgpaFilter, setCgpaFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/auth/getUserData"
      );
      setUserData(response.data.data);
      setFilteredData(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.data.length,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    const filtered = userData.filter((item) => {
      const nameMatch = nameFilter
        ? item.fullName.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      const cgpaMatch = cgpaFilter ? item.cgpa >= parseFloat(cgpaFilter) : true;
      const branchMatch = branchFilter ? item.branch === branchFilter : true;
      return nameMatch && cgpaMatch && branchMatch;
    });

    setFilteredData(filtered);
    setPagination((prev) => ({ ...prev, current: 1, total: filtered.length }));
  };

  const resetFilters = () => {
    setNameFilter("");
    setCgpaFilter("");
    setBranchFilter("");
    setFilteredData(userData);
    setPagination((prev) => ({ ...prev, current: 1, total: userData.length }));
  };

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({ ...prev, current: newPagination.current }));
  };

  const branches = [...new Set(userData.map((item) => item.branch))];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Row style={{ padding: "16px" }}>
          <Col span={24}>
            <Card title="Filter Options" style={{ marginBottom: "16px" }}>
              <Space direction="horizontal" style={{ marginBottom: "16px" }} wrap>
                <Input
                  placeholder="Filter by name"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  style={{ width: 200 }}
                />
                <Input
                  placeholder="Min CGPA"
                  value={cgpaFilter}
                  onChange={(e) => setCgpaFilter(e.target.value)}
                  type="number"
                  min={0}
                  max={10}
                  style={{ width: 150 }}
                />
                <Select
                  placeholder="Select Branch"
                  value={branchFilter}
                  onChange={(value) => setBranchFilter(value)}
                  allowClear
                  style={{ width: 150 }}
                >
                  {branches.map((branch) => (
                    <Select.Option key={branch} value={branch}>
                      {branch}
                    </Select.Option>
                  ))}
                </Select>
                <Button type="primary" onClick={handleFilter}>
                  Apply Filters
                </Button>
                <Button onClick={resetFilters}>Reset</Button>
              </Space>
            </Card>
          </Col>
        </Row>
        <Row style={{ padding: "0 16px 16px" }}>
          <Col span={24}>
            {loading ? (
              <Spin size="large" style={{ display: "block", margin: "auto" }} />
            ) : (
              <Table
                dataSource={filteredData}
                columns={columns}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="email"
                style={{ width: "100%" }}
              />
            )}
          </Col>
        </Row>
      </Layout>
    </Layout>
  );
};

export default DetailedView;
