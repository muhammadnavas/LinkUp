// File: src/pages/LeaderboardPage.js
import React from 'react';

const LeaderboardPage = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Leaderboard</h1>
        <p className="text-gray-600 mb-4">See how you rank among other talented developers.</p>
        <div className="text-yellow-600">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <p className="text-gray-500">Leaderboard feature coming soon...</p>
      </div>
    </div>
  );
};

export default LeaderboardPage;
