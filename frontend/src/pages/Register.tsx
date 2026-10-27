
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import Navbar from '../components/layout/Navbar';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-grow animate-opacity-fade-in">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <Sparkles className="text-white w-8 h-8" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Create Your Account</h1>
              <p className="text-gray-600 text-center mb-8">Join MedASK AI and take control of your health</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-2 text-sm text-center">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-800 placeholder-gray-400"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-800 placeholder-gray-400"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-gray-800 placeholder-gray-400"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 py-6 hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                
                <div className="text-center">
                  <span className="text-gray-600">Already have an account?</span>{' '}
                  <Link to="/login" className="text-purple-600 hover:underline">
                    Sign In
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
