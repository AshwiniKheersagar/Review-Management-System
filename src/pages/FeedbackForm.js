import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiStar, 
  FiLoader,
  FiUser,
  FiThumbsUp,
  FiTrendingUp,
  FiSmile,
  FiMeh,
  FiFrown,
  FiArrowLeft
} from 'react-icons/fi';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function FeedbackForm() {
  const { email: urlEmail } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEdit = location.state?.isEdit;
  const feedbackData = location.state?.feedbackData;

  const [formData, setFormData] = useState({
    email: urlEmail || '',
    strengths: '',
    areas_to_improve: '',
    sentiment: 'positive',
    rating: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    success: false,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && feedbackData) {
      setFormData({
        email: urlEmail || '',
        strengths: feedbackData.strengths,
        areas_to_improve: feedbackData.areas_to_improve,
        sentiment: feedbackData.sentiment,
        rating: feedbackData.rating
      });
    } else if (urlEmail) {
      setFormData(prev => ({
        ...prev,
        email: urlEmail
      }));
    }
  }, [isEdit, feedbackData, urlEmail]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const isFormValid = () => {
    return (
      formData.email.trim() !== '' &&
      formData.strengths.trim() !== '' &&
      formData.areas_to_improve.trim() !== '' &&
      formData.rating > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = isEdit && feedbackData?.id 
        ? `http://localhost:8000/feedback/${feedbackData.id}`
        : 'http://localhost:8000/feedback';
      
      const method = isEdit ? 'put' : 'post';
      
      const requestData = {
        employee_id: formData.email,
        strengths: formData.strengths,
        areas_to_improve: formData.areas_to_improve,
        sentiment: formData.sentiment,
        rating: formData.rating
      };
      
      await axios[method](endpoint, requestData, {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setModalContent({
        success: true,
        message: isEdit 
          ? 'Feedback updated successfully!' 
          : 'Feedback submitted successfully!'
      });
      setShowModal(true);
      
      if (!isEdit) {
        resetForm();
      }
    } catch (err) {
      setModalContent({
        success: false,
        message: err.response?.data?.detail || err.message || 
          (isEdit ? 'Error updating feedback' : 'Error submitting feedback')
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: urlEmail || '',
      strengths: '',
      areas_to_improve: '',
      sentiment: 'positive',
      rating: 0
    });
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalContent.success) {
      navigate('/manager/teams');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl text-center animate-popIn">
            {modalContent.success ? (
              <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
            ) : (
              <FiXCircle className="text-red-500 text-5xl mx-auto mb-4" />
            )}
            <h3 className="text-xl font-semibold mb-2">
              {modalContent.success ? 'Success!' : 'Error!'}
            </h3>
            <p className="text-gray-600 mb-6">{modalContent.message}</p>
            <button
              onClick={closeModal}
              className={`px-6 py-2 rounded-lg font-medium ${
                modalContent.success
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 text-white hover:text-indigo-200 transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold flex items-center justify-center">
            <FiTrendingUp className="mr-2" />
            {isEdit ? 'Edit Feedback' : 'Employee Feedback'}
          </h2>
          <p className="text-indigo-100 text-center">
            {isEdit ? 'Update your feedback' : 'Share your valuable feedback'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FiUser className="mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
                urlEmail ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Enter employee email"
              required
              readOnly={!!urlEmail}
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FiThumbsUp className="mr-2" />
              Strengths
            </label>
            <textarea
              name="strengths"
              value={formData.strengths}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="What went well..."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FiTrendingUp className="mr-2" />
              Areas to Improve
            </label>
            <textarea
              name="areas_to_improve"
              value={formData.areas_to_improve}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="What needs improvement..."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FiSmile className="mr-2" />
              Overall Sentiment
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'positive', icon: <FiSmile className="mr-1" />, label: 'Positive' },
                { value: 'neutral', icon: <FiMeh className="mr-1" />, label: 'Neutral' },
                { value: 'negative', icon: <FiFrown className="mr-1" />, label: 'Negative' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="sentiment"
                    value={option.value}
                    checked={formData.sentiment === option.value}
                    onChange={handleChange}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="flex items-center">
                    {option.icon}
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FiStar className="mr-2" />
              Performance Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => handleRating(value)}
                  className={`text-2xl transition-colors ${
                    formData.rating >= value ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-500`}
                >
                  <FiStar />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.rating} star{formData.rating !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                !isFormValid() || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCheckCircle className="mr-2" />
                  {isEdit ? 'Update Feedback' : 'Submit Feedback'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;