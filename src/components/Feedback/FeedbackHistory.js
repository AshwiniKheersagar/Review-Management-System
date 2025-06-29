import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiArrowLeft,
  FiStar,
  FiThumbsUp,
  FiTrendingUp,
  FiClock,
  FiUser,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2, 
  FiTrash2
} from 'react-icons/fi';
import SentimentIndicator from './SentimentIndicator';

const FeedbackHistory = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  const [state, setState] = useState({
    feedbackHistory: [],
    loading: true,
    error: null,
    employeeInfo: null,
    page: 1,
    totalPages: 1,
    refreshKey: 0,
    showDeleteModal: false,
    feedbackToDelete: null
  });

  
  
  const {
    feedbackHistory,
    loading,
    error,
    employeeInfo,
    page,
    totalPages,
    refreshKey,
    showDeleteModal,
    feedbackToDelete
  } = state;

  console.log(feedbackHistory);
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const fetchFeedbackHistory = async () => {
      try {
        updateState({ loading: true, error: null });
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        const [historyRes, employeeRes] = await Promise.all([
          axios.get(`http://localhost:8000/feedback/history/${employeeId}?page=${page}`, {
            headers: { Authorization: `Bearer ${userData.token}` }
          }),
          axios.get(`http://localhost:8000/employees/${employeeId}`, {
            headers: { Authorization: `Bearer ${userData.token}` }
          })
        ]);

        const feedbackData = historyRes.data.feedbacks || historyRes.data;
        const validatedFeedback = feedbackData.map(feedback => ({
          id: feedback.id,
          strengths: feedback.strengths || 'No strengths provided',
          areas_to_improve: feedback.areas_to_improve || 'No areas for improvement noted',
          sentiment: feedback.sentiment || 'neutral',
          rating: feedback.rating || 0,
          created_at: feedback.created_at,
          manager_name: feedback.manager_name || 'Unknown Manager',
          is_acknowledged: feedback.is_acknowledged || false
        }));

        updateState({
          feedbackHistory: validatedFeedback,
          employeeInfo: employeeRes.data,
          totalPages: historyRes.data.total_pages || 1,
          loading: false
        });
      } catch (err) {
        updateState({
          error: err.response?.data?.detail || err.message || 'Failed to load feedback history',
          loading: false
        });
      }
    };

    fetchFeedbackHistory();
  }, [employeeId, page, refreshKey]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateState({ page: newPage });
    }
  };

  const handleEdit = (feedback) => {
    console.log(feedback.is_acknowledged);
    
    if (feedback.is_acknowledged) return;
    
    navigate(`/feedback/${employeeInfo.email}`, {
      state: {
        feedbackData: {
          id: feedback.id,
          strengths: feedback.strengths,
          areas_to_improve: feedback.areas_to_improve,
          sentiment: feedback.sentiment,
          rating: feedback.rating
        },
        isEdit: true
      }
    });
  };

 const handleDeleteInit = (feedbackId, isAcknowledged) => {
  if (isAcknowledged) return;
  
  updateState({
    feedbackToDelete: feedbackId,
    showDeleteModal: true
  });
};

  const handleDeleteConfirm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      await axios.delete(`http://localhost:8000/feedback/${feedbackToDelete}`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      updateState({
        showDeleteModal: false,
        refreshKey: refreshKey + 1
      });
    } catch (err) {
      updateState({
        error: err.response?.data?.detail || err.message || 'Failed to delete feedback'
      });
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const ErrorDisplay = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6 max-w-md bg-white rounded-xl shadow-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Feedback</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  const EmployeeHeader = () => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center">
        <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 mr-4">
          <FiUser className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {employeeInfo.name || 'Employee'}
          </h1>
          {employeeInfo.email && (
            <p className="text-gray-500">{employeeInfo.email}</p>
          )}
        </div>
      </div>
    </div>
  );

  const FeedbackItem = ({ feedback }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  const fetchComments = async () => {
    if (comments !== null) {
      setShowComments(!showComments);
      return;
    }

    try {
      setLoadingComments(true);
      setCommentsError(null);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.get(
        `http://localhost:8000/feedback/${feedback.id}/acknowledgment`,
        {
          headers: { Authorization: `Bearer ${userData.token}` }
        }
      );
      setComments(response.data.comment || "No comments provided");
      setShowComments(true);
    } catch (err) {
      setCommentsError(err.response?.data?.detail || err.message || 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const isAcknowledged = feedback.is_acknowledged;
  const canEdit = !isAcknowledged;
  const canDelete = !isAcknowledged;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-gray-800 flex items-center">
              <FiClock className="mr-2" />
              {feedback.created_at ? (
                new Date(feedback.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              ) : 'Date not available'}
            </h3>
            {feedback.manager_name && (
              <p className="text-sm text-gray-500">
                Provided by {feedback.manager_name}
              </p>
            )}
            {isAcknowledged && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Acknowledged
              </span>
            )}
          </div>
          <div className="flex items-center">
            <SentimentIndicator sentiment={feedback.sentiment} />
            <div className="ml-2 flex items-center">
              <FiStar className="text-yellow-400 mr-1" />
              <span className="font-medium">{feedback.rating}/5</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 flex items-center mb-2">
              <FiThumbsUp className="mr-2" />
              Strengths
            </h4>
            <p className="text-gray-700">{feedback.strengths}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 flex items-center mb-2">
              <FiTrendingUp className="mr-2" />
              Areas for Improvement
            </h4>
            <p className="text-gray-700">{feedback.areas_to_improve}</p>
          </div>
        </div>

        {/* Comments section */}
        <div className="mb-4">
          <button
            onClick={fetchComments}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            {showComments ? 'Hide Comments' : 'View Comments'}
            {loadingComments && (
              <span className="ml-2 inline-block animate-spin">
                <FiRefreshCw className="text-sm" />
              </span>
            )}
          </button>
          
          {commentsError && (
            <p className="text-red-500 text-sm mt-1">{commentsError}</p>
          )}
          
          {showComments && comments && (
            <div className="mt-2 bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-700">{comments}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => handleEdit(feedback)}
            disabled={!canEdit}
            className={`p-2 rounded-lg transition-colors ${
              canEdit 
                ? 'text-indigo-600 hover:bg-indigo-50' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={canEdit ? "Edit feedback" : "Cannot edit acknowledged feedback"}
          >
            <FiEdit2 />
          </button>
          <button 
            onClick={() => handleDeleteInit(feedback.id, isAcknowledged)}
            disabled={!canDelete}
            className={`p-2 rounded-lg transition-colors ${
              canDelete 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={canDelete ? "Delete feedback" : "Cannot delete acknowledged feedback"}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

  const PaginationControls = () => (
    totalPages > 1 && (
      <div className="flex justify-center mt-8">
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`p-2 rounded-lg ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
          >
            <FiChevronLeft className="text-xl" />
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-lg ${page === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
          >
            <FiChevronRight className="text-xl" />
          </button>
        </nav>
      </div>
    )
  );

  const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <div className="text-gray-400 text-5xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Feedback History
      </h3>
      <p className="text-gray-500">
        You haven't provided any feedback for this employee yet.
      </p>
    </div>
  );

  if (loading && page === 1) return <LoadingSpinner />;
  if (error) return <ErrorDisplay />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Team
          </button>
          <button
            onClick={() => updateState({ refreshKey: refreshKey + 1 })}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
        </div>

        {employeeInfo ? <EmployeeHeader /> : (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-pulse">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full p-3 mr-4"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {feedbackHistory.length === 0 ? <EmptyState /> : (
            <>
              {feedbackHistory.map(feedback => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
              ))}
              <PaginationControls />
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            {feedbackToDelete && feedbackHistory.find(f => f.id === feedbackToDelete)?.is_acknowledged ? (
              <>
                <h2 className="text-xl font-bold mb-4">Cannot Delete</h2>
                <p className="mb-6">This feedback has been acknowledged and cannot be deleted.</p>
                <button
                  onClick={() => updateState({ showDeleteModal: false })}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  OK
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                <p className="mb-6">Are you sure you want to delete this feedback? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => updateState({ showDeleteModal: false })}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;