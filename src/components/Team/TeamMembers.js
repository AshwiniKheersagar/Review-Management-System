import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiUser,
  FiStar, 
  FiPlus,
  FiArrowRight,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiTrash2,
  FiCheck,
  FiX,
  FiMessageSquare
} from 'react-icons/fi';

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get('http://localhost:8000/manager/teams', {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      
      setTeamMembers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleRemoveMember = async (memberId) => {
    try {
      setDeletingId(memberId);
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      await axios.delete(`http://localhost:8000/manager/team/${memberId}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      
      await fetchTeamMembers();
      setConfirmDelete(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to remove member');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (memberId) => {
    navigate(`/feedback/history/${memberId}`);
  };

  const handleFeedbackClick = (memberEmail, e) => {
    e.stopPropagation();
    navigate(`/feedback/${memberEmail}`);
  };

  const handleViewClick = (memberId, e) => {
    e.stopPropagation();
    navigate(`/feedback/history/${memberId}`);
  };

  const handleAddMember = () => {
    navigate('/team/add');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FiLoader className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-xl shadow-md">
          <FiAlertCircle className="mx-auto text-5xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Team</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Team</h1>
            <p className="text-gray-600">
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} in your team
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddMember}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
            >
              <FiPlus className="mr-2" />
              Add Member
            </button>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FiUser className="mx-auto text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No matching members found' : 'Your team is empty'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Add team members to get started'}
            </p>
            <button
              onClick={handleAddMember}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FiPlus className="inline mr-2" />
              Add Team Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
                onClick={() => handleCardClick(member.id)}
              >
                {confirmDelete === member.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-4 z-10">
                    <p className="text-center mb-4 font-medium">
                      Remove {member.name} from your team?
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                      >
                        <FiX className="mr-1" /> Cancel
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={deletingId === member.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50"
                      >
                        {deletingId === member.id ? (
                          <FiLoader className="animate-spin mr-1" />
                        ) : (
                          <FiCheck className="mr-1" />
                        )}
                        Confirm
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 mr-4">
                          <FiUser className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                          <p className="text-gray-500 text-sm">{member.email}</p>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {member.role}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-800">Feedback Given</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {member.feedback_count}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-purple-800">Member Since</div>
                      <div className="text-sm font-medium text-purple-600">
                        {new Date(member.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <FiStar className="text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      Last feedback: {member.feedback_count > 0 ? 'Given' : 'None yet'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => handleFeedbackClick(member.email, e)}
                      className="text-white bg-indigo-600 hover:bg-indigo-700 flex items-center px-3 py-1 rounded-lg transition-colors"
                    >
                      <FiMessageSquare className="mr-1" />
                      Feedback
                    </button>
                    <button
                      onClick={(e) => handleViewClick(member.id, e)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <FiArrowRight className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(member.id);
                      }}
                      className="text-red-600 hover:text-red-800 flex items-center ml-2"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;