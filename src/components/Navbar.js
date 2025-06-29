import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiHome, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { isLoggedIn, logout, employeeID, name, role, userId } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (role === 'manager') {
      return '/manager/teams';
    } else if (role === 'employee' && userId) {
      return `/myFeedback/${employeeID}`;
    }
    return '/';
  };

  const handleNameClick = () => {
    if (role === 'manager') {
      navigate('/manager');
    } else if (role === 'employee') {
      navigate('/employee');
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo and main nav items */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="https://www.dpdzero.com/_astro/dpdzero.jZjkEI8r.png"
                  alt="Company Logo"
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-4 sm:flex sm:space-x-2 md:space-x-4">
              <Link
                to="/"
                className="text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiHome className="mr-1" /> Home
              </Link>
              
              {isLoggedIn && (
                <Link
                  to={getDashboardPath()}
                  className="text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FiUser className="mr-1" /> {role === 'manager' ? 'My Team' : 'My Feedback'}
                </Link>
              )}
            </div>
          </div>

          {/* Right side items */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {role}
                  </span>
                  <button 
                    onClick={handleNameClick}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                  >
                    {name}
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiLogOut className="mr-1" /> 
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 hidden sm:inline">
                <button
                  onClick={() => navigate('/login?role=employee')}
                  className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <span>Employee Login</span> 
                </button>
                <button
                  onClick={() => navigate('/login?role=manager')}
                  className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <span>Manager Login</span> 
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-gray-100 text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <FiHome className="mr-2" /> Home
            </Link>
            
            {isLoggedIn && (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <FiUser className="mr-2" /> {role === 'manager' ? 'My Team' : 'My Feedback'}
                </Link>
                <button
                  onClick={handleNameClick}
                  className="w-full text-left text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <span className="ml-2">Dashboard</span>
                </button>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 px-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center">
                  <div className="text-left">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {role}
                    </div>
                    <button
                      onClick={handleNameClick}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                    >
                      {name}
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/login?role=employee');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Employee Login
                </button>
                <button
                  onClick={() => {
                    navigate('/login?role=manager');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Manager Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;