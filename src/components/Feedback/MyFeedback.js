import React, { useState, useEffect, useCallback } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiStar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiMessageSquare,
  FiX,
} from "react-icons/fi";

const SentimentIndicator = ({ sentiment }) => {
  const colors = {
    positive: "bg-green-100 text-green-800",
    neutral: "bg-blue-100 text-blue-800",
    negative: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[sentiment]}`}
    >
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
};

const MyFeedback = () => {
  const { employeeID } = useParams();
  const [acknowledging, setAcknowledging] = useState(null);
  const [ackComment, setAckComment] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [acknowledgmentDetails, setAcknowledgmentDetails] = useState(null);
 

  const [state, setState] = useState({
    feedbacks: [],
    loading: true,
    error: null,
    employeeInfo: null,
    isAuthorized: true,
  });

  const { feedbacks, loading, error, employeeInfo, isAuthorized } = state;

  const fetchFeedbacks = useCallback(async () => {
    try {
      const parsedEmployeeID = parseInt(employeeID);
      if (isNaN(parsedEmployeeID) || parsedEmployeeID <= 0) {
        throw new Error("Invalid employee ID");
      }

      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData?.token) throw new Error("Authentication token missing");

      setState(prev => ({ ...prev, loading: true, error: null }));

      const [feedbackRes, employeeRes] = await Promise.all([
        axios.get(`http://localhost:8000/feedback/employee/${parsedEmployeeID}`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        }),
        axios.get(`http://localhost:8000/employees/${parsedEmployeeID}`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        }),
      ]);

      // Filter to only include unacknowledged feedback
      const unacknowledgedFeedbacks = feedbackRes.data.filter(f => !f.is_acknowledged);

      setState({
        feedbacks: unacknowledgedFeedbacks,
        employeeInfo: employeeRes.data,
        loading: false,
        isAuthorized: true,
      });
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.detail || err.message || "Failed to load feedback",
        feedbacks: [],
      }));
    }
  }, [employeeID]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleAcknowledge = async (feedbackId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData?.token) throw new Error("Authentication token missing");

      await axios.post(
        `http://localhost:8000/feedback/${feedbackId}/acknowledge`,
        { comment: ackComment },
        { headers: { Authorization: `Bearer ${userData.token}` } }
      );

      // Refresh the feedback list
      await fetchFeedbacks();
      setAcknowledging(null);
      setAckComment("");
    } catch (err) {
      console.error("Acknowledgment failed:", err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.detail || "Failed to acknowledge feedback"
      }));
    }
  };

  const handleExpandFeedback = (feedbackId) => {
    setExpandedFeedback(feedbackId);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const ErrorDisplay = () => (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="text-red-500 text-5xl mb-4 flex justify-center">
        <FiAlertCircle />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Error Loading Feedback
      </h2>
      <p className="text-gray-600 mb-4">{error}</p>
    </div>
  );

  const UnauthorizedView = () => (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="text-yellow-500 text-5xl mb-4 flex justify-center">
        <FiAlertCircle />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-4">
        You don't have permission to view this employee's feedback
      </p>
    </div>
  );

  const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <div className="text-gray-400 text-5xl mb-4">🎉</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        All Feedback Acknowledged
      </h3>
      <p className="text-gray-500 mb-6">
        You have no pending feedback to acknowledge.
      </p>
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <UnauthorizedView />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorDisplay />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        
        {feedbacks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-lg transition"
                onClick={() => handleExpandFeedback(feedback.id)}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 text-sm flex items-center">
                    <FiClock className="mr-1" />
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                  <SentimentIndicator sentiment={feedback.sentiment} />
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-gray-700 mb-1 text-sm">Rating</h4>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded w-max">
                    <FiStar className="text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-yellow-700">{feedback.rating}/5</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-green-700 text-sm">Strengths</h4>
                  <p className="text-gray-700 text-sm line-clamp-3">{feedback.strengths}</p>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-blue-700 text-sm">Areas to Improve</h4>
                  <p className="text-gray-700 text-sm line-clamp-3">{feedback.areas_to_improve}</p>
                </div>

                <div className="text-right mt-4">
                  <button
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAcknowledging(feedback.id);
                      
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Acknowledgment Dialog */}
        {acknowledging && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiMessageSquare className="mr-2" />
                Add a comment (optional)
              </h4>
              
              <textarea
                className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                rows={4}
                placeholder="Share your thoughts about this feedback..."
                value={ackComment}
                onChange={(e) => setAckComment(e.target.value)}
              />
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setAcknowledging(null);
                    setAckComment("");
                  }}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAcknowledge(acknowledging)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
                >
                  <FiCheckCircle className="mr-2" />
                  Confirm Acknowledgment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Detail Modal */}
        {expandedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setExpandedFeedback(null);
                  setAcknowledgmentDetails(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
              
              {(() => {
                const feedback = feedbacks.find(f => f.id === expandedFeedback);
                if (!feedback) return null;

                return (
                  <>
                    <h2 className="text-xl font-bold mb-4">Feedback Detail</h2>
                    <p className="text-gray-600 text-sm mb-4 flex items-center">
                      <FiClock className="mr-2" />
                      {new Date(feedback.created_at).toLocaleString()}
                    </p>
                    
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-700">Rating</h4>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                          <FiStar className="text-yellow-400 mr-1" />
                          <span className="font-medium text-yellow-700">{feedback.rating}/5</span>
                        </div>
                      </div>
                      <SentimentIndicator sentiment={feedback.sentiment} />
                    </div>
                    
                    <div className="mb-5">
                      <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                      <p className="text-gray-800 bg-green-50 p-4 rounded-lg">{feedback.strengths}</p>
                    </div>
                    
                    <div className="mb-5">
                      <h4 className="font-semibold text-blue-700 mb-2">Areas to Improve</h4>
                      <p className="text-gray-800 bg-blue-50 p-4 rounded-lg">{feedback.areas_to_improve}</p>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setExpandedFeedback(null);
                          setAcknowledging(feedback.id);
                        }}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                      >
                        <FiCheckCircle className="mr-2" />
                        Acknowledge This Feedback
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFeedback;