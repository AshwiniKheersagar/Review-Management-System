import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import { AuthContext } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedbackForm from "./pages/FeedbackForm";
import Navbar from "./components/Navbar";
import TeamMembers from "./components/Team/TeamMembers";
import AddTeamMember from "./components/Team/AddTeamMember";
import FeedbackHistory from "./components/Feedback/FeedbackHistory";
import MyFeedback from "./components/Feedback/MyFeedback";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
import ManagerDashboard from "./components/Dashboard/ManagerDashboard";

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <div className="min-h-screen flex flex-col">
          {auth.isLoggedIn && <Navbar />}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage />} />
              <Route
                path="/feedback/:email?"
                element={
                  <ProtectedRoute role="manager">
                    <FeedbackForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/teams"
                element={
                  <ProtectedRoute role="manager">
                    <TeamMembers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team/add"
                element={
                  <ProtectedRoute role="manager">
                    <AddTeamMember />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback/history/:employeeId"
                element={
                  <ProtectedRoute role="manager">
                    <FeedbackHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/myFeedback/:employeeID"
                element={
                  <ProtectedRoute role="employee">
                    <MyFeedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager"
                element={
                  <ProtectedRoute role="manager">
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee"
                element={
                  <ProtectedRoute role="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;