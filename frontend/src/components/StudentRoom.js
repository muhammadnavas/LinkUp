import React, { useState, useEffect } from "react";
import '../output.css'

export default function StudentRoom() {
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("challenges");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [submissionCode, setSubmissionCode] = useState("");

  useEffect(() => {
    // Mock data - replace with actual API calls
    setChallenges([
      {
        id: 1,
        title: "React Component Challenge",
        company: "TechCorp",
        description: "Create a responsive login form using React and Tailwind CSS",
        difficulty: "Medium",
        deadline: "2025-09-15",
        points: 100
      },
      {
        id: 2,
        title: "Algorithm Challenge",
        company: "DataSoft",
        description: "Implement a binary search algorithm with optimal time complexity",
        difficulty: "Hard",
        deadline: "2025-09-20",
        points: 150
      },
      {
        id: 3,
        title: "CSS Animation Task",
        company: "DesignHub",
        description: "Create smooth animations for a landing page hero section",
        difficulty: "Easy",
        deadline: "2025-09-10",
        points: 75
      }
    ]);

    setSubmissions([
      {
        id: 1,
        challengeTitle: "React Component Challenge",
        status: "Submitted",
        score: 85,
        submittedAt: "2025-08-25"
      },
      {
        id: 2,
        challengeTitle: "Previous Algorithm Task",
        status: "Reviewed",
        score: 92,
        submittedAt: "2025-08-20"
      }
    ]);
  }, []);

  const handleSubmit = (challengeId) => {
    if (!submissionCode.trim()) {
      alert("Please enter your solution code");
      return;
    }
    
    // Mock submission - replace with actual API call
    const newSubmission = {
      id: submissions.length + 1,
      challengeTitle: challenges.find(c => c.id === challengeId)?.title,
      status: "Submitted",
      score: null,
      submittedAt: new Date().toISOString().split('T')[0]
    };
    
    setSubmissions([newSubmission, ...submissions]);
    setSubmissionCode("");
    setSelectedChallenge(null);
    alert("Solution submitted successfully!");
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Easy": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Submitted": return "text-blue-600 bg-blue-100";
      case "Reviewed": return "text-green-600 bg-green-100";
      case "Pending": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          {["challenges", "submissions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-blue-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Available Challenges</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Company:</span>
                      <span className="font-medium">{challenge.company}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-medium">{challenge.deadline}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Points:</span>
                      <span className="font-medium text-blue-600">{challenge.points}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedChallenge(challenge)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Start Challenge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Submissions</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.challengeTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.score ? `${submission.score}/100` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.submittedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Challenge Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedChallenge.title}</h2>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">{selectedChallenge.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-500">Company: <strong>{selectedChallenge.company}</strong></span>
                    <span className="text-gray-500">Deadline: <strong>{selectedChallenge.deadline}</strong></span>
                    <span className="text-gray-500">Points: <strong>{selectedChallenge.points}</strong></span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Solution:
                  </label>
                  <textarea
                    value={submissionCode}
                    onChange={(e) => setSubmissionCode(e.target.value)}
                    placeholder="Write your solution here..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit(selectedChallenge.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Submit Solution
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}