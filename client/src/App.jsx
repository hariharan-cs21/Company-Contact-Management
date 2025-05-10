import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Spin } from "antd";
import Login from "./pages/LoginPage";
import Registration from "./pages/RegisterPage";
import RecruitersDashboard from "./pages/Recruiter/RecruitersDashboard";
import SetPassword from "./pages/Student/SetPassword";
import Student from "./pages/Student/Dashboard";
import ViewApplications from "./pages/PlacementCoordinator/ViewApplication";
import UploadStudent from "./pages/PlacementCoordinator/UploadStudent";
import DetailedView from "./pages/PlacementCoordinator/DetailedView";
import Profile from "./pages/Student/Profile";

import apiClient from "./apiClient";
import API_ENDPOINTS from "./constant";

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.SESSION)
      .then((response) => {
        setIsAuthenticated(response.data.loggedIn);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/recruiter" element={<RecruitersDashboard />} />
        <Route path="/placement" element={<UploadStudent />} />
        <Route
          path="/placement/view-applications"
          element={<ViewApplications />}
        />

        <Route path="/students" element={<Student />} />
        <Route path="/placement/detailed-view" element={<DetailedView />} />

        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/recruiter"
          element={<ProtectedRoute element={<RecruitersDashboard />} />}
        />
        <Route
          path="/student/profile"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path="/placement"
          element={<ProtectedRoute element={<UploadStudent />} />}
        />
        <Route
          path="/placement/view-applications"
          element={<ProtectedRoute element={<ViewApplications />} />}
        />
        <Route
          path="/students"
          element={<ProtectedRoute element={<Student />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
