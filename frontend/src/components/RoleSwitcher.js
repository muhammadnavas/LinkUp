import React from 'react';

// Switcher for login/register roles
const RoleSwitcher = ({ currentRole, onSwitch }) => (
  <div className="flex justify-center mb-4">
    {["student", "company"].map((role) => (
      <button
        key={role}
        className={`px-4 py-2 rounded mx-1 font-semibold transition 
          ${
            currentRole === role
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-blue-200"
          }
        `}
        onClick={() => onSwitch(role)}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </button>
    ))}
  </div>
);

export default RoleSwitcher;