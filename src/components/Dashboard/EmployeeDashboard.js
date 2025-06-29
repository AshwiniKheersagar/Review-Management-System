import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiStar, FiThumbsUp, FiTrendingUp, FiClock,FiMessageSquare, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import SentimentIndicator from './SentimentIndicator';
import { useAuth } from '../../hooks/useAuth';

const EmployeeDashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    feedbacks: [],
    loading: true,
    error: null,
    timeFilter: 'all'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, timelineRes] = await Promise.all([
          axios.get('http://localhost:8000/employee/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8000/employee/feedback/timeline?time_filter=${dashboardData.timeFilter}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
// Sort feedbacks: unacknowledged first, then by date (newest first)
        
        const sortedFeedbacks = timelineRes.data
          .map(f => ({
            ...f,
            created_at: new Date(f.created_at)
          }))
          .sort((a, b) => {
            if (a.is_acknowledged !== b.is_acknowledged) {
              return a.is_acknowledged ? 1 : -1;
            }
            return b.created_at - a.created_at;
          });

        setDashboardData({
          ...dashboardData,
          stats: statsRes.data,
          feedbacks: sortedFeedbacks,
          loading: false
        });
      } catch (err) {
        setDashboardData({
          ...dashboardData,
          error: err.response?.data?.detail || err.message,
          loading: false
        });
      }
    };
    if (token) {
      fetchData();
    }
  }, [dashboardData.timeFilter, token]);

  const handleTimeFilterChange = (filter) => {
    setDashboardData({ ...dashboardData, timeFilter: filter, loading: true });
  };

  const handleAcknowledgeFeedback = async (feedbackId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/employee/feedback/${feedbackId}/acknowledge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the specific feedback in state
      setDashboardData(prev => ({
        ...prev,
        feedbacks: prev.feedbacks.map(f => 
          f.id === feedbackId 
            ? { ...f, is_acknowledged: true, acknowledgment_comment: response.data.comment }
            : f
        )
      }));
    } catch (err) {
      console.error("Error acknowledging feedback:", err);
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="mb-4">{dashboardData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon, value, label }) => (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
      <div className="mr-4 p-3 rounded-full bg-indigo-100 text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-500">{label}</p>
      </div>
    </div>
  );

  const FeedbackCard = ({ feedback }) => (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden mb-6 border-l-4 ${
      feedback.sentiment === 'positive' ? 'border-green-500' :
      feedback.sentiment === 'negative' ? 'border-red-500' : 'border-blue-500'
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium flex items-center">
              <FiClock className="mr-2" />
              {feedback.created_at.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </h3>
            <p className="text-sm text-gray-500">From {feedback.manager_name}</p>
            {feedback.is_acknowledged ? (
              <span className="inline-flex items-center mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                <FiCheckCircle className="mr-1" /> Acknowledged
              </span>
            ) : (
              <span className="inline-flex items-center mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                <FiAlertCircle className="mr-1" /> Pending Acknowledgment
              </span>
            )}
          </div>
          <div className="flex items-center">
            <SentimentIndicator sentiment={feedback.sentiment} />
            <div className="ml-2 flex items-center">
              <FiStar className="text-yellow-400 mr-1" />
              <span>{feedback.rating}/5</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 flex items-center mb-2">
              <FiThumbsUp className="mr-2" /> Strengths
            </h4>
            <p>{feedback.strengths}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 flex items-center mb-2">
              <FiTrendingUp className="mr-2" /> Areas to Improve
            </h4>
            <p>{feedback.areas_to_improve}</p>
          </div>
        </div>

        {feedback.acknowledgment_comment ? (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium flex items-center mb-2">
              <FiMessageSquare className="mr-2" /> Your Response
            </h4>
            <p>{feedback.acknowledgment_comment}</p>
          </div>
        ) : !feedback.is_acknowledged && (
          <div className="mt-4">
            <button
              onClick={() => handleAcknowledgeFeedback(feedback.id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <FiCheckCircle className="mr-2" />
              Acknowledge Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold">Your Feedback Dashboard</h1>
            <p className="text-gray-500">Overview of your performance feedback</p>
          </div>
          
          <div className="flex space-x-2 bg-white rounded-lg shadow-sm p-1">
            {['all', 'month', 'quarter', 'year'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleTimeFilterChange(filter)}
                className={`px-3 py-1 text-sm rounded-md ${
                  dashboardData.timeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FiStar />}
            value={dashboardData.stats.total_feedback}
            label="Total Feedback"
          />
          <StatCard
            icon={<FiThumbsUp />}
            value={dashboardData.stats.avg_rating}
            label="Average Rating"
          />
          <StatCard
            icon={<FiTrendingUp />}
            value={dashboardData.stats.positive_count}
            label="Positive Feedback"
          />
          <StatCard
            icon={<FiMessageSquare />}
            value={`${dashboardData.stats.acknowledged_count}/${dashboardData.stats.total_feedback}`}
            label="Acknowledged"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Feedback Timeline</h2>
            <div className="text-sm text-gray-500">
              {dashboardData.feedbacks.filter(f => !f.is_acknowledged).length} pending acknowledgments
            </div>
          </div>
          
          {dashboardData.feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
              <p className="text-gray-500">
                {dashboardData.timeFilter === 'all'
                  ? "You haven't received any feedback yet."
                  : `No feedback in the last ${dashboardData.timeFilter}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {dashboardData.feedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;