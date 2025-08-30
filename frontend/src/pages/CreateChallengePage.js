// File: src/pages/CreateChallengePage.js
import React from 'react';

const CreateChallengePage = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Create New Challenge</h1>
        <p className="text-gray-600 mb-4">Design coding challenges to discover talented developers.</p>
        <div className="text-green-600">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-gray-500">Challenge creation feature coming soon...</p>
      </div>
    </div>
  );
};

export default CreateChallengePage;