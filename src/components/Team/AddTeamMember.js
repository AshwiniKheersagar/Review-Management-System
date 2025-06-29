import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiUser,
  FiPlus,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiUsers
} from 'react-icons/fi';

const AddTeamMember = () => {
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnassignedEmployees = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData?.token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get('http://localhost:8000/employees/unassigned', {
          headers: {
            Authorization: `Bearer ${userData.token}`
          }
        });
        setUnassignedEmployees(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch unassigned employees');
      } finally {
        setLoading(false);
      }
    };

    fetchUnassignedEmployees();
  }, []);

  const filteredEmployees = unassignedEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToTeam = async (employeeEmail) => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      await axios.post('http://localhost:8000/manager/team/add', {
        employee_email: employeeEmail
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      // Remove the added employee from the list
      setUnassignedEmployees(prev => 
        prev.filter(emp => emp.email !== employeeEmail)
      );
      
      setSuccessMessage('Employee added to your team successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add employee to team');
    } finally {
      setLoading(false);
    }
  };

  if (loading && unassignedEmployees.length === 0) {
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Employees</h2>
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
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <FiUsers className="mr-2" />
              Add Team Members
            </h1>
            <p className="text-gray-600">
              {unassignedEmployees.length} unassigned employee{unassignedEmployees.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="relative mt-4 md:mt-0 w-full md:w-96">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
            <FiCheck className="mr-2" />
            {successMessage}
          </div>
        )}

        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FiUser className="mx-auto text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No matching employees found' : 'No unassigned employees available'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'All employees have been assigned to managers'}
            </p>
            <button
              onClick={() => navigate('/manager/teams')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Team
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 mr-4">
                        <FiUser className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{employee.name}</h3>
                        <p className="text-gray-500 text-sm">{employee.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToTeam(employee.email)}
                      disabled={loading}
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        loading
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      } transition`}
                    >
                      {loading ? (
                        <FiLoader className="animate-spin mr-2" />
                      ) : (
                        <FiPlus className="mr-2" />
                      )}
                      Add to Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTeamMember;