// src/pages/EditChallengePage.js
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getChallenge, updateChallenge } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function EditChallengePage() {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated or not a company
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    if (user?.role !== 'company') {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    points: 50,
    tags: '',
    deadline: '',
    requirements: '',
    submissionFormat: 'github',
    maxSubmissions: 1
  });

  // Examples state
  const [examples, setExamples] = useState([
    { input: '', output: '', explanation: '' }
  ]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Load challenge data
  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await getChallenge(challengeId);
      const challenge = response.data || response;
      
      // Check if user owns this challenge
      if (challenge.companyId._id !== user.id) {
        navigate('/company');
        return;
      }

      // Populate form with existing data
      setFormData({
        title: challenge.title || '',
        description: challenge.description || '',
        difficulty: challenge.difficulty || 'Easy',
        points: challenge.points || 50,
        tags: challenge.tags ? challenge.tags.join(', ') : '',
        deadline: challenge.deadline ? new Date(challenge.deadline).toISOString().split('T')[0] : '',
        requirements: challenge.requirements || '',
        submissionFormat: challenge.submissionFormat || 'github',
        maxSubmissions: challenge.maxSubmissions || 1
      });

      setExamples(challenge.examples && challenge.examples.length > 0 
        ? challenge.examples 
        : [{ input: '', output: '', explanation: '' }]
      );

    } catch (error) {
      console.error('Error fetching challenge:', error);
      setSubmitError('Failed to load challenge data');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle example changes
  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...examples];
    updatedExamples[index][field] = value;
    setExamples(updatedExamples);
  };

  // Add new example
  const addExample = () => {
    setExamples(prev => [...prev, { input: '', output: '', explanation: '' }]);
  };

  // Remove example
  const removeExample = (index) => {
    if (examples.length > 1) {
      setExamples(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    if (formData.points < 10 || formData.points > 1000) {
      newErrors.points = 'Points must be between 10 and 1000';
    }

    if (formData.requirements && formData.requirements.length > 2000) {
      newErrors.requirements = 'Requirements must be less than 2000 characters';
    }

    // Validate examples
    const validExamples = examples.filter(ex => ex.input.trim() && ex.output.trim());
    if (validExamples.length === 0) {
      newErrors.examples = 'At least one example with input and output is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare data for submission
      const challengeData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        examples: examples.filter(ex => ex.input.trim() && ex.output.trim()),
        points: parseInt(formData.points),
        maxSubmissions: parseInt(formData.maxSubmissions)
      };

      const response = await updateChallenge(challengeId, challengeData);

      if (response.success) {
        alert('✅ Challenge updated successfully!');
        navigate('/company');
      } else {
        setSubmitError(response.error || 'Failed to update challenge');
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      setSubmitError('Failed to update challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date for deadline (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Show loading if not authenticated yet or loading challenge
  if (!isAuthenticated || user?.role !== 'company' || loading) {
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/company')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Challenge</h1>
          <div></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Build a REST API with Node.js"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="10"
                  max="1000"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.points ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.points && <p className="mt-1 text-sm text-red-600">{errors.points}</p>}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="JavaScript, React, API (comma separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.deadline ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                placeholder="Provide a detailed description of the challenge, including what needs to be built, any specific requirements, and evaluation criteria..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/5000 characters
              </p>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
              <button
                type="button"
                onClick={addExample}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Add Example
              </button>
            </div>
            
            {errors.examples && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.examples}</p>
              </div>
            )}

            {examples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-700">Example {index + 1}</h3>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Input
                    </label>
                    <textarea
                      value={example.input}
                      onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                      rows={3}
                      placeholder="Sample input..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Output
                    </label>
                    <textarea
                      value={example.output}
                      onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                      rows={3}
                      placeholder="Expected output..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={example.explanation}
                    onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                    rows={2}
                    placeholder="Explain the example..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Additional Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Submission Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Format
                </label>
                <select
                  name="submissionFormat"
                  value={formData.submissionFormat}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="github">GitHub Repository</option>
                  <option value="code">Code Snippet</option>
                  <option value="text">Text Description</option>
                  <option value="file">File Upload</option>
                </select>
              </div>

              {/* Max Submissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Submissions
                </label>
                <input
                  type="number"
                  name="maxSubmissions"
                  value={formData.maxSubmissions}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Number of attempts allowed per student</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any specific technical requirements, constraints, or evaluation criteria..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.requirements ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>}
              <p className="mt-1 text-sm text-gray-500">
                {formData.requirements.length}/2000 characters
              </p>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{submitError}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/company')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
