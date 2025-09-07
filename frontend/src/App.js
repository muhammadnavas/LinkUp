import { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import "./index.css";

// Context
import { AuthProvider } from "./contexts/AuthContext";

// Components
import AppRoutes from "./components/AppRoutes";
import Header from "./components/Header";

// Main App Component
function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [activeRole, setActiveRole] = useState("student");

  return (
    <AuthProvider>
      <Router>
        <AppContent 
          showRegister={showRegister}
          setShowRegister={setShowRegister}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
        />
      </Router>
    </AuthProvider>
  );
}

// App Content Component (separated to use auth context)
const AppContent = ({ showRegister, setShowRegister, activeRole, setActiveRole }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <AppRoutes 
          showRegister={showRegister}
          setShowRegister={setShowRegister}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
        />
      </main>
    </div>
  );
};

export default App;
