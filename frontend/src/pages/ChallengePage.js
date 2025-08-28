import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    // Mock challenge data - replace with actual API call
    const mockChallenge = {
      id: parseInt(id),
      title: "Build a Responsive Todo App",
      company: "TechCorp",
      description: `Create a fully functional todo application with the following features:
      
• Add new tasks with due dates
• Mark tasks as complete/incomplete
• Delete tasks
• Filter tasks by status (all, completed, pending)
• Responsive design that works on mobile and desktop
• Local storage to persist tasks between sessions

Requirements:
- Use React with functional components and hooks
- Implement proper state management
- Use CSS Grid or Flexbox for layout
- Include proper error handling
- Write clean, readable code with comments

Bonus points for:
- Adding task categories/tags
- Implementing drag and drop reordering
- Adding task priority levels
- Including animations and transitions`,
      difficulty: "Medium",
      points: 150,
      deadline: "2025-09-15T23:59:59",
      timeLimit: 180, // minutes
      tags: ["React", "JavaScript", "CSS", "Frontend"],
      resources: [
        "React Documentation: https://react.dev",
        "CSS Grid Guide: https://css-tricks.com/snippets/css/complete-guide-grid/",
        "Local Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
      ],
      examples: [
        {
          input: "User clicks 'Add Task' button",
          output: "New task appears in the list with current timestamp"
        },
        {
          input: "User checks a task as complete",
          output: "Task is visually marked as completed and moved to completed section"
        }
      ],
      submissionFormat: "Please submit your complete React component code including HTML, CSS, and JavaScript. Make sure to include instructions for running your application.",
      evaluation: [
        "Code quality and structure (30%)",
        "Feature completeness (25%)",
        "User interface and experience (20%)",
        "Responsive design (15%)",
        "Code documentation (10%)"
      ]
    };

    setChallenge(mockChallenge);

    // Calculate time remaining
    const updateTimeRemaining = () => {
      const deadline = new Date(mockChallenge.deadline);
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

    updateTimeRemaining();
    const timer = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [id]);

  const handleSubmit = async () => {
    if (!solution.trim()) {
      alert("Please enter your solution before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("Solution submitted successfully! You will receive feedback within 24-48 hours.");
      navigate("/student");
    } catch (error) {
      alert("Error submitting solution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Easy": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (!challenge) {
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Challenge Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{challenge.title}</h1>
                  <p className="text-gray-600">by {challenge.company}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {challenge.points} points
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {challenge.timeLimit} min suggested
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Challenge Description</h2>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">{challenge.description}</pre>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Examples</h2>
              <div className="space-y-4">
                {challenge.examples.map((example, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Input:</span>
                      <p className="text-gray-800 mt-1">{example.input}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Expected Output:</span>
                      <p className="text-gray-800 mt-1">{example.output}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Helpful Resources</h2>
              <ul className="space-y-2">
                {challenge.resources.map((resource, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="text-gray-700">{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {challenge.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Evaluation Criteria</h3>
              <ul className="space-y-2">
                {challenge.evaluation.map((criteria, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    {criteria}
                  </li>
                ))}
              </ul>
            </div>

            {/* Submission Format */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Submission Format</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{challenge.submissionFormat}</p>
            </div>
          </div>
        </div>

        {/* Solution Editor */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Solution</h2>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Write your complete solution here... Include all HTML, CSS, and JavaScript code."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
          />
          
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Tip:</span> Make sure to test your solution thoroughly before submitting.
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Solution"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}