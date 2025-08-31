// src/pages/ChallengePage.js
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChallenge, submitSolution } from "../api";
import { useAuth } from '../contexts/AuthContext';

export default function ChallengePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  // State
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch challenge and start countdown
  useEffect(() => {
    if (!id || id === "undefined") {
      setLoadError("Invalid challenge ID. Please select a valid challenge.");
      setLoading(false);
      return;
    }

    let timer;

    async function fetchChallenge() {
      try {
        setLoading(true);
        setLoadError("");
        
        const res = await getChallenge(id);

        if (!res.success || !res.data) {
          setLoadError(res.error || "Challenge not found.");
          setLoading(false);
          return;
        }

        setChallenge(res.data);
        
        // Start countdown timer
        timer = setInterval(() => {
          updateTimeRemaining(res.data.deadline);
        }, 60000); // Update every minute
        
        updateTimeRemaining(res.data.deadline); // Initial call
        setLoading(false);
        
      } catch (err) {
        console.error("Error fetching challenge:", err);
        setLoadError("Failed to load challenge. Please try again later.");
        setLoading(false);
      }
    }

    fetchChallenge();

    // Cleanup timer on unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [id]);

  // Update time remaining
  const updateTimeRemaining = (deadlineStr) => {
    if (!deadlineStr) {
      setTimeRemaining("");
      return;
    }
    
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline - now;

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    } else {
      setTimeRemaining("Expired");
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!solution.trim()) {
      setSubmitError("Please enter your solution before submitting.");
      return;
    }

    // Check if deadline has passed
    if (challenge && new Date() > new Date(challenge.deadline)) {
      setSubmitError("Challenge deadline has passed.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      // Use new API signature
      const res = await submitSolution({
        challengeId: id,
        solution,
        // Add other fields if needed (repoLink, codeSubmission, etc.)
      });
      
      if (res.success) {
        alert("705 Solution submitted successfully! You will receive feedback within 24-48 hours.");
        navigate(user?.role === 'student' ? '/student' : '/company');
      } else {
        setSubmitError(res.error || "Failed to submit solution.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("Error submitting solution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">{loadError}</p>
          <button
            onClick={() => navigate(user?.role === 'student' ? '/student' : '/company')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(user?.role === 'student' ? '/student' : '/company')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Challenges
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Time remaining:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              timeRemaining === "Expired" 
                ? "bg-red-100 text-red-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {timeRemaining || "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Challenge Details */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {challenge && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{challenge.title}</h1>
                <p className="text-gray-600">Company: <span className="font-medium">{challenge.company}</span></p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {challenge.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {challenge.points} points
                </span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <div className="text-gray-700 whitespace-pre-wrap">{challenge.description}</div>
            </div>

            {challenge.requirements && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {challenge.requirements}
                </div>
              </div>
            )}

            {challenge.examples && challenge.examples.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Examples</h3>
                {challenge.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <div>
                        <strong className="text-sm text-gray-600">Input:</strong>
                        <pre className="bg-white p-2 rounded border mt-1 text-sm overflow-x-auto">
                          {example.input}
                        </pre>
                      </div>
                      <div>
                        <strong className="text-sm text-gray-600">Output:</strong>
                        <pre className="bg-white p-2 rounded border mt-1 text-sm overflow-x-auto">
                          {example.output}
                        </pre>
                      </div>
                    </div>
                    {example.explanation && (
                      <div className="mt-2">
                        <strong className="text-sm text-gray-600">Explanation:</strong>
                        <p className="text-sm text-gray-700 mt-1">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {challenge.tags && challenge.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Submission Format: {challenge.submissionFormat}</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {challenge.submissionFormat === 'github' && 'Please provide a GitHub repository link with your solution.'}
                    {challenge.submissionFormat === 'code' && 'Please paste your complete code solution below.'}
                    {challenge.submissionFormat === 'text' && 'Please provide a detailed text description of your solution.'}
                    {challenge.submissionFormat === 'file' && 'Please upload your solution files.'}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Maximum submissions allowed: {challenge.maxSubmissions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solution Editor: Only show for students */}
        {user?.role === 'student' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Solution</h2>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {challenge?.submissionFormat === 'github' && 'GitHub Repository URL'}
                {challenge?.submissionFormat === 'code' && 'Code Solution'}
                {challenge?.submissionFormat === 'text' && 'Solution Description'}
                {challenge?.submissionFormat === 'file' && 'Solution Details'}
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder={
                  challenge?.submissionFormat === 'github' ? 'https://github.com/username/repository-name' :
                  challenge?.submissionFormat === 'code' ? 'Paste your complete code solution here...' :
                  challenge?.submissionFormat === 'text' ? 'Describe your solution approach and implementation...' :
                  'Provide details about your solution files and implementation...'
                }
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                disabled={timeRemaining === "Expired"}
              />
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">💡 Submission Tips:</p>
                <ul className="space-y-1">
                  <li>• Test your solution thoroughly before submitting</li>
                  <li>• Make sure your code is well-commented and readable</li>
                  <li>• Include a README if submitting via GitHub</li>
                  {challenge?.submissionFormat === 'github' && (
                    <li>• Ensure your repository is public or accessible</li>
                  )}
                </ul>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || timeRemaining === "Expired" || !solution.trim()}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  isSubmitting || timeRemaining === "Expired" || !solution.trim()
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : 
                 timeRemaining === "Expired" ? "Challenge Expired" : 
                 "Submit Solution"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}