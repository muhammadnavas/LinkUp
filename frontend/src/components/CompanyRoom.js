import React, { useState, useEffect } from "react";

export default function CompanyRoom() {
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("challenges");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    deadline: "",
    points: 100
  });

  useEffect(() => {
    // Mock data - replace with actual API calls
    setChallenges([
      {
        id: 1,
        title: "React Component Challenge",
        description: "Create a responsive login form using React and Tailwind CSS",
        difficulty: "Medium",
        deadline: "2025-09-15",
        points: 100,
        submissions: 12,
        status: "Active"
      },
      {
        id: 2,
        title: "Database Design Task",
        description: "Design a normalized database schema for an e-commerce platform",
        difficulty: "Hard",
        deadline: "2025-09-20",
        points: 150,
        submissions: 8,
        status: "Active"
      }
    ]);

    setSubmissions([
      {
        id: 1,
        challengeTitle: "React Component Challenge",
        studentName: "John Doe",
        studentEmail: "john.doe@email.com",
        submittedAt: "2025-08-25",
        code: "import React from 'react';\n\nfunction LoginForm() {\n  return (\n    <form className='bg-white p-6 rounded'>\n      <input type='email' placeholder='Email' />\n      <input type='password' placeholder='Password' />\n      <button type='submit'>Login</button>\n    </form>\n  );\n}",
        status: "Pending",
        score: null
      },
      {
        id: 2,
        challengeTitle: "React Component Challenge",
        studentName: "Jane Smith",
        studentEmail: "jane.smith@email.com",
        submittedAt: "2025-08-24",
        code: "import React, { useState } from 'react';\n\nfunction LoginForm() {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n\n  return (\n    <div className='max-w-md mx-auto'>\n      <form className='bg-white p-8 rounded-lg shadow'>\n        <h2 className='text-2xl mb-4'>Login</h2>\n        <input \n          type='email' \n          value={email}\n          onChange={(e) => setEmail(e.target.value)}\n          className='w-full p-2 mb-4 border rounded'\n          placeholder='Email' \n        />\n        <input \n          type='password'\n          value={password}\n          onChange={(e) => setPassword(e.target.value)} \n          className='w-full p-2 mb-4 border rounded'\n          placeholder='Password' \n        />\n        <button \n          type='submit'\n          className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700'\n        >\n          Login\n        </button>\n      </form>\n    </div>\n  );\n}",
        status: "Reviewed",
        score: 92
      }
    ]);
  }, []);

  const handleCreateChallenge = (e) => {
    e.preventDefault();
    if (!newChallenge.title || !newChallenge.description || !newChallenge.deadline) {
      alert("Please fill all required fields");
      return;
    }

    const challenge = {
      id: challenges.length + 1,
      ...newChallenge,
      submissions: 0,
      status: "Active"
    };

    setChallenges([challenge, ...challenges]);
    setNewChallenge({
      title: "",
      description: "",
      difficulty: "Medium",
      deadline: "",
      points: 100
    });
    setShowCreateForm(false);
    alert("Challenge created successfully!");
  };

  const handleScoreSubmission = (submissionId, score) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, score: parseInt(score), status: "Reviewed" }
        : sub
    ));
    setSelectedSubmission(null);
    alert("Submission scored successfully!");
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
      case "Pending": return "text-yellow-600 bg-yellow-100";
      case "Reviewed": return "text-green-600 bg-green-100";
      case "Active": return "text-blue-600 bg-blue-100";
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
          <h1 className="text-3xl font-bold text-gray-800">Company Dashboard</h1>
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">My Challenges</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Create New Challenge
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                        {challenge.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{challenge.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-medium">{challenge.deadline}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Points:</span>
                      <span className="font-medium text-blue-600">{challenge.points}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Submissions:</span>
                      <span className="font-medium text-green-600">{challenge.submissions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Student Submissions</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.challengeTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.studentName}</div>
                          <div className="text-sm text-gray-500">{submission.studentEmail}</div>
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <form onSubmit={handleCreateChallenge} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create New Challenge</h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenge Title *
                    </label>
                    <input
                      type="text"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                      className="w-full p-3 h-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={newChallenge.difficulty}
                        onChange={(e) => setNewChallenge({...newChallenge, difficulty: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline *
                      </label>
                      <input
                        type="date"
                        value={newChallenge.deadline}
                        onChange={(e) => setNewChallenge({...newChallenge, deadline: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points
                      </label>
                      <input
                        type="number"
                        value={newChallenge.points}
                        onChange={(e) => setNewChallenge({...newChallenge, points: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Challenge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Review Submission Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedSubmission.challengeTitle}</h2>
                    <p className="text-gray-600">By {selectedSubmission.studentName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Student's Solution:</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{selectedSubmission.code}</code>
                  </pre>
                </div>

                {selectedSubmission.status === "Pending" && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Score this submission:</h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Score (0-100)"
                        className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id={`score-${selectedSubmission.id}`}
                      />
                      <button
                        onClick={() => {
                          const scoreInput = document.getElementById(`score-${selectedSubmission.id}`);
                          const score = scoreInput.value;
                          if (score >= 0 && score <= 100) {
                            handleScoreSubmission(selectedSubmission.id, score);
                          } else {
                            alert("Please enter a score between 0 and 100");
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Submit Score
                      </button>
                    </div>
                  </div>
                )}

                {selectedSubmission.status === "Reviewed" && (
                  <div className="mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-800">Already Reviewed</h3>
                      <p className="text-green-600">Score: {selectedSubmission.score}/100</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Close
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