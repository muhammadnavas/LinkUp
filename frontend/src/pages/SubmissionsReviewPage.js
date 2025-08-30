// File: src/pages/SubmissionsReviewPage.js
import React from 'react';

const SubmissionsReviewPage = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Review Submissions</h1>
        <p className="text-gray-600 mb-4">Evaluate and score student submissions for your challenges.</p>
        <div className="text-purple-600">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <p className="text-gray-500">Submission review feature coming soon...</p>
      </div>
    </div>
  );
};

export default SubmissionsReviewPage;