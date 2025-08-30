// File: src/pages/ProfilePage.js
import React from 'react';

const ProfilePage = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile Settings</h1>
        <p className="text-gray-600 mb-4">Manage your account information and preferences.</p>
        <div className="text-gray-600">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-gray-500">Profile management feature coming soon...</p>
      </div>
    </div>
  );
};

export default ProfilePage;