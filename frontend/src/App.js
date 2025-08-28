import React, { useState, useEffect } from "react";
import './output.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import StudentRoom from "./components/StudentRoom";
import CompanyRoom from "./components/CompanyRoom";

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeRole, setActiveRole] = useState("student");

  useEffect(() => {
    if (userRole) localStorage.setItem("role", userRole);
    else localStorage.removeItem("role");
  }, [userRole]);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
  };

  // Switcher for login/register roles
  const RoleSwitcher = ({ currentRole, onSwitch }) => (
    <div className="flex justify-center mb-4">
      {["student", "company"].map((role) => (
        <button
          key={role}
          className={`px-4 py-2 rounded mx-1 font-semibold transition 
            ${currentRole === role ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-200"}
          `}
          onClick={() => onSwitch(role)}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Routes>
          <Route
            path="/"
            element={
              userRole ? (
                <Navigate to={userRole === "student" ? "/student" : "/company"} />
              ) : (
                <div className="space-y-6 w-full max-w-4xl">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-2"
                    onClick={() => setShowRegister((v) => !v)}
                    aria-label={showRegister ? "Go to Login" : "Go to Register"}
                  >
                    {showRegister ? "Go to Login" : "Register"}
                  </button>

                  <RoleSwitcher currentRole={activeRole} onSwitch={setActiveRole} />

                  <div className="flex flex-col items-center md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-4">
                    {showRegister ? (
                      <RegisterForm role={activeRole} onRegisterSuccess={handleLoginSuccess} />
                    ) : (
                      <LoginForm role={activeRole} onLoginSuccess={handleLoginSuccess} />
                    )}
                  </div>
                </div>
              )
            }
          />

          <Route
            path="/student"
            element={userRole === "student" ? <StudentRoom /> : <Navigate to="/" />}
          />
          <Route
            path="/company"
            element={userRole === "company" ? <CompanyRoom /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}