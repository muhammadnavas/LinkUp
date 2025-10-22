// src/pages/ChallengePage.js
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChallenge, getUserSubmissions, submitSolution } from "../api";
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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

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
        
        // Check if user already submitted for this challenge
        try {
          const submissionsRes = await getUserSubmissions();
          if (submissionsRes.success) {
            const userSubmission = submissionsRes.data.find(
              sub => sub.challenge._id === id || sub.challenge === id
            );
            if (userSubmission) {
              setExistingSubmission(userSubmission);
            }
          }
        } catch (submissionErr) {
          console.error("Error checking submissions:", submissionErr);
        }
        
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
        // Fetch the submission details to display status
        const submissionsRes = await getUserSubmissions();
        if (submissionsRes.success) {
          const userSubmission = submissionsRes.data.find(
            sub => sub.challenge._id === id || sub.challenge === id
          );
          if (userSubmission) {
            setExistingSubmission(userSubmission);
          }
        }
        alert("Solution submitted successfully! You will receive feedback within 24-48 hours.");
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

  // Handle share challenge
  const handleShare = (platform) => {
    const challengeUrl = window.location.href;
    const shareText = `Check out this coding challenge: ${challenge?.title}`;
    
    switch(platform) {
      case 'copy':
        navigator.clipboard.writeText(challengeUrl);
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareMenu(false);
        }, 2000);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(challengeUrl)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(challengeUrl)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + challengeUrl)}`, '_blank');
        setShowShareMenu(false);
        break;
      default:
        break;
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate(user?.role === 'student' ? '/student' : '/company')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">Back to Challenges</span>
          </button>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600">Time remaining:</span>
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {challenge && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">{challenge.title}</h1>
                <p className="text-sm sm:text-base text-gray-600">Company: <span className="font-medium">{challenge.company}</span></p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Share Challenge"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  
                  {/* Share Menu Dropdown */}
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {copySuccess ? '✓ Copied!' : 'Copy Link'}
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Share on LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Share on WhatsApp
                      </button>
                    </div>
                  )}
                </div>
                
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
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Submission Format: GitHub Repository</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Please provide a GitHub repository link with your solution. Make sure your repository is public or accessible.
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
            {existingSubmission ? (
              // Show submission status if already submitted
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Submission</h2>
                
                <div className={`p-6 rounded-lg border-2 ${
                  existingSubmission.status === 'approved' ? 'bg-green-50 border-green-300' :
                  existingSubmission.status === 'rejected' ? 'bg-red-50 border-red-300' :
                  existingSubmission.status === 'reviewing' ? 'bg-blue-50 border-blue-300' :
                  'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        existingSubmission.status === 'approved' ? 'bg-green-200' :
                        existingSubmission.status === 'rejected' ? 'bg-red-200' :
                        existingSubmission.status === 'reviewing' ? 'bg-blue-200' :
                        'bg-yellow-200'
                      }`}>
                        {existingSubmission.status === 'approved' && (
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {existingSubmission.status === 'rejected' && (
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {existingSubmission.status === 'reviewing' && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                        {existingSubmission.status === 'pending' && (
                          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${
                          existingSubmission.status === 'approved' ? 'text-green-800' :
                          existingSubmission.status === 'rejected' ? 'text-red-800' :
                          existingSubmission.status === 'reviewing' ? 'text-blue-800' :
                          'text-yellow-800'
                        }`}>
                          Status: {existingSubmission.status.charAt(0).toUpperCase() + existingSubmission.status.slice(1)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Submitted on {new Date(existingSubmission.submittedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {existingSubmission.score !== null && existingSubmission.score !== undefined && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {existingSubmission.score}
                        </div>
                        <p className="text-sm text-gray-600">Score</p>
                      </div>
                    )}
                  </div>

                  {existingSubmission.feedback && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Feedback:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{existingSubmission.feedback}</p>
                    </div>
                  )}

                  {existingSubmission.solution && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Your Solution:</h4>
                      <a 
                        href={existingSubmission.solution}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {existingSubmission.solution}
                      </a>
                    </div>
                  )}

                  {existingSubmission.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        <strong>⏳ Awaiting Review:</strong> Your submission is waiting to be reviewed by the company. You'll receive feedback within 24-48 hours.
                      </p>
                    </div>
                  )}

                  {existingSubmission.status === 'reviewing' && (
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>👀 Under Review:</strong> Your submission is currently being reviewed. Check back soon for feedback!
                      </p>
                    </div>
                  )}

                  {existingSubmission.status === 'approved' && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <p className="text-green-800 text-sm">
                        <strong>🎉 Congratulations!</strong> Your submission has been approved! You've earned {existingSubmission.score} points.
                      </p>
                    </div>
                  )}

                  {existingSubmission.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-red-800 text-sm">
                        <strong>❌ Submission Rejected:</strong> Please review the feedback above and consider improving your solution.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm mb-3">
                    You've already submitted a solution for this challenge. Only one submission is allowed per challenge.
                  </p>
                  <button
                    onClick={() => navigate('/submissions')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View All My Submissions
                  </button>
                </div>
              </div>
            ) : (
              // Show submission form if not yet submitted
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Solution</h2>
                
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository URL *
                  </label>
                  <input
                    type="url"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="https://github.com/username/repository-name"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={timeRemaining === "Expired"}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Paste the full URL of your GitHub repository containing the solution
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">💡 Submission Tips:</p>
                    <ul className="space-y-1">
                      <li>• Ensure your repository is public or accessible</li>
                      <li>• Include a detailed README with setup instructions</li>
                      <li>• Test your solution thoroughly before submitting</li>
                      <li>• Make sure your code is well-commented and readable</li>
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
        )}
      </div>
    </div>
  );
}