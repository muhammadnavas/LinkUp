import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChallenge, submitSolution } from "../api";

export default function ChallengePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State
  const [challenge, setChallenge] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch challenge and start countdown
  useEffect(() => {
    if (!id || id === "undefined") {
      setLoadError("Invalid challenge ID. Please select a valid challenge.");
      return;
    }

    let timer;

    async function fetchChallenge() {
      try {
        const res = await getChallenge(id);

        if (!res.data || Object.keys(res.data).length === 0) {
          setLoadError("No challenges available.");
        } else {
          setChallenge(res.data);

          // Start countdown
          timer = setInterval(() => {
            updateTimeRemaining(res.data.deadline);
          }, 60000);
          updateTimeRemaining(res.data.deadline); // Initial call
        }
      } catch (err) {
        setLoadError("Failed to load challenge. Please try again later.");
      }
    }

    fetchChallenge();

    return () => clearInterval(timer);
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
      alert("Please enter your solution before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitSolution(id, { solution });
      alert("✅ Solution submitted successfully! You will receive feedback within 24-48 hours.");
      navigate("/student");
    } catch (error) {
      alert("❌ Error submitting solution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) {
    if (loadError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-red-600 text-lg font-semibold">{loadError}</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/student")}
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Challenges
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Time remaining:</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {timeRemaining}
            </span>
          </div>
        </div>
      </div>

      {/* Solution Editor */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Solution</h2>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Write your complete solution here..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
          />
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Tip:</span> Make sure to test your solution thoroughly before submitting.
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
