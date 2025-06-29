import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleClick=(role)=>{
      navigate(`/login?role=${role}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex flex-col items-center justify-center px-4 py-8">
      {/* Header Section */}
      <header className="text-center mb-10 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-800 mb-4">
          Welcome to DPDzero Feedback Portal
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Share feedback, grow together — a simple space for managers and employees.
        </p>
      </header>

      {/* Cards Section */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full max-w-5xl px-4">
        {/* Manager Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full sm:w-80 text-center transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">Manager Login</h2>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">
            Submit and review feedback for your team members.
          </p>
          <button onClick={()=>handleClick('manager')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl w-full">
            Login as Manager
          </button>
        </div>

        {/* Employee Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full sm:w-80 text-center transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Employee Login</h2>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">
            View feedback shared with you and acknowledge it.
          </p>
          <button onClick={()=>handleClick('employee')}  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl w-full">
            Login as Employee
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
