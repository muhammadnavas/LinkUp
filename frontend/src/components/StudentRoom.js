import React, { useState, useEffect } from "react";
import { CheckCircleIcon, LockClosedIcon, ClockIcon } from "@heroicons/react/24/solid";

const challengesData = [
  { id: 1, title: "React Basics", status: "Completed" },
  { id: 2, title: "API Integration", status: "In Progress" },
  { id: 3, title: "JWT Authentication", status: "Locked" }
];

const submissionsData = [
  { id: 1, challenge: "React Basics", score: 90, date: "2025-08-21" },
  { id: 2, challenge: "API Integration", score: null, date: null }
];

function getStatusBadge(status) {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 gap-1">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          Completed
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 gap-1">
          <ClockIcon className="h-5 w-5 text-yellow-500" />
          In Progress
        </span>
      );
    case "Locked":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-800 gap-1">
          <LockClosedIcon className="h-5 w-5 text-gray-500" />
          Locked
        </span>
      );
    default:
      return null;
  }
}

export default function StudentRoom() {
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    setChallenges(challengesData);
    setSubmissions(submissionsData);
  }, []);

  const completedCount = challenges.filter(c => c.status === "Completed").length;
  const progressPercent = challenges.length ? Math.round((completedCount / challenges.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-blue-900">Student Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome! Here you can view your challenges, submissions, and progress.</p>
        </div>

        {/* Challenges Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Your Challenges</h2>
          <ul>
            {challenges.map(challenge => (
              <li key={challenge.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <span className="font-medium text-gray-900">{challenge.title}</span>
                {getStatusBadge(challenge.status)}
              </li>
            ))}
          </ul>
        </div>

        {/* Submissions Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Recent Submissions</h2>
          <ul>
            {submissions.map(sub => (
              <li key={sub.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="font-medium text-gray-900">{sub.challenge}</div>
                <div>
                  {sub.score !== null ? (
                    <span className="text-green-700 font-semibold">
                      Score: {sub.score} / 100
                      <span className="ml-2 text-gray-500 text-xs">({sub.date})</span>
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">Not submitted yet</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2 overflow-hidden">
            <div
              className="bg-blue-600 h-6 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-right mt-1 text-sm text-gray-800 font-semibold">
            {progressPercent}% completed
          </div>
        </div>
      </div>
    </div>
  );
}