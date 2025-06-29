import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiStar, FiMessageSquare, FiTrendingUp, FiBarChart2, FiCalendar ,FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ManagerDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    teamStats: [],
    trends: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overviewRes, teamStatsRes, trendsRes] = await Promise.all([
          axios.get('http://localhost:8000/manager/dashboard/overview', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/manager/dashboard/team-stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8000/manager/dashboard/feedback-trends?time_range=${timeRange}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDashboardData({
          overview: overviewRes.data,
          teamStats: teamStatsRes.data,
          trends: trendsRes.data
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, timeRange]);

  const StatCard = ({ icon, value, label, onClick }) => (
    <div 
      className="bg-white rounded-xl shadow-md p-6 flex items-center cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className="mr-4 p-3 rounded-full bg-indigo-100 text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-500">{label}</p>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const ErrorDisplay = () => (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="text-red-500 text-5xl mb-4 flex justify-center">
        <FiAlertCircle />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Error Loading Dashboard
      </h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Try Again
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Team Performance Dashboard</h1>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<FiUsers />} 
            value={dashboardData.overview?.team_size || 0} 
            label="Team Members"
            onClick={() => navigate('/manager/teams')}
          />
          <StatCard 
            icon={<FiMessageSquare />} 
            value={dashboardData.overview?.total_feedback_given || 0} 
            label="Total Feedback Given"
            
          />
          <StatCard 
            icon={<FiStar />} 
            value={dashboardData.overview?.avg_team_rating || 0} 
            label="Avg Team Rating"
          />
          <StatCard 
            icon={<FiTrendingUp />} 
            value={
              dashboardData.overview?.sentiment_distribution?.positive || 0
            } 
            label="Positive Feedback"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sentiment Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Feedback Sentiment</h2>
              <FiBarChart2 className="h-5 w-5 text-indigo-600" />
            </div>
            {dashboardData.overview?.sentiment_distribution ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(dashboardData.overview.sentiment_distribution).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.keys(dashboardData.overview.sentiment_distribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No sentiment data available</p>
            )}
          </div>

          {/* Feedback Trends */}
          <div className="bg-white rounded-xl shadow-md p-6 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Feedback Trends</h2>
              <div className="flex items-center space-x-2">
                <FiCalendar className="h-5 w-5 text-indigo-600" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
            {dashboardData.trends?.feedback_trends?.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.trends.feedback_trends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time_period" 
                      tickFormatter={(value) => {
                        if (timeRange === 'month') {
                          return new Date(value + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        }
                        return value;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="feedback_count" 
                      name="Feedback Count"
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg_rating" 
                      name="Avg Rating"
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No trend data available</p>
            )}
          </div>
        </div>

        {/* Team Members Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Team Members Performance</h2>
            <FiUsers className="h-5 w-5 text-indigo-600" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback Count
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Feedback
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recent Sentiment
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.teamStats.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.feedback_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.avg_rating ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {member.avg_rating}/5
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No feedback</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.last_feedback_date ? (
                        new Date(member.last_feedback_date).toLocaleDateString()
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.sentiment ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          member.sentiment === 'neutral' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {member.sentiment}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/feedback/history/${member.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/feedback/${member.email}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Add Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Feedback</h2>
            <FiMessageSquare className="h-5 w-5 text-indigo-600" />
          </div>
          
          {dashboardData.overview?.recent_feedback?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.overview.recent_feedback.map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/feedback/history/${feedback.employee_id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{feedback.employee_name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        feedback.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        feedback.sentiment === 'neutral' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feedback.sentiment}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FiStar className="mr-1" /> {feedback.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent feedback</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;