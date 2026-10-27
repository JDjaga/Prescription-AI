import React from 'react';
import { Button } from '../components/ui/button';
import Navbar from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const GetStarted = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-white text-gray-800">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center py-12 animate-opacity-fade-in">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-200 p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to MedASK AI</h1>
          <p className="text-gray-600 mb-8">Your AI-powered assistant for medication questions, health insights, and more. Get started by creating an account or logging in.</p>
          <div className="flex flex-col gap-4">
            <Button className="w-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:opacity-90 hover:shadow-xl transition-all duration-200" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button variant="outline" className="w-full border-purple-500 text-purple-700 py-4 text-lg font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200" onClick={() => navigate('/register')}>
              Create Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GetStarted;
