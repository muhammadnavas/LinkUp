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
      const res = await submitSolution(id, { solution });
      
      if (res.success) {
        alert("✅ Solution submitted successfully! You will receive feedback within 24-48 hours.");
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

            {challenge.examples && challenge.examples.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Examples</h3>
                {challenge.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-2">
                    <div className="mb-2">
                      <strong>Input:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{example.input}</code>
                    </div>
                    <div>
                      <strong>Output:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{example.output}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {challenge.tags && challenge.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Solution Editor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Solution</h2>
          
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Write your complete solution here..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            disabled={timeRemaining === "Expired"}
          />
          
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Tip:</span> Make sure to test your solution thoroughly before submitting.
            </p>
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
      </div>
    </div>
  );
}