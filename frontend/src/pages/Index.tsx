import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import PrescriptionUpload from '../components/upload/PrescriptionUpload';
import MedicineExplanation from '../components/medicine/MedicineExplanation';
import NaturalRemedies from '../components/remedies/NaturalRemedies';
import ChatInterface from '../components/chat/ChatInterface';
import HealthJournal from '../components/journal/HealthJournal';
import DemoChat from '../components/home/DemoChat';
import DemoTabs from '../components/home/DemoTabs';
import DemoExperience from '../components/home/DemoExperience';
import { Button } from '../components/ui/button';

import { Link } from 'react-router-dom'; // Link is already here, useNavigate will be added above
import { Card, CardContent } from '../components/ui/card';
import { Check } from 'lucide-react';

import { supabase } from '../supabaseClient';

type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

const mockMoodEmojis: Record<Mood, string> = {
  great: '😁',
  good: '🙂',
  okay: '😐',
  bad: '😔',
  terrible: '😣',
};

interface JournalEntry {
  id: string;
  date: Date;
  symptoms: string[];
  medications: string[];
  notes: string;
  mood: Mood;
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(),
    symptoms: ['Headache', 'Fatigue'],
    medications: ['Paracetamol'],
    notes: 'Felt tired but okay.',
    mood: 'good',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000),
    symptoms: ['Cough'],
    medications: ['Cough Syrup'],
    notes: 'Mild cough, took syrup.',
    mood: 'okay',
  },
];

const mockDeleteEntry = (id: string) => {
  alert(`Mock delete for entry id: ${id}`);
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const navigateToJournalPage = () => {
    navigate('/journal');
  };
  
  return (
    <div className="relative flex flex-col min-h-screen bg-white text-gray-800">
      {/* Removed previous background orb container and all orb divs */}
      {/* Hero-style background effect using a single, larger blurred element */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100 via-indigo-50 to-white opacity-70 blur-3xl" />
      </div>
      <Navbar />
      
      <main className="flex-grow animate-opacity-fade-in">
        <Hero />
        <Features />
        
        <section className="section-padding">
          <div className="container mx-auto px-4">
            {/* Removed animate-fade-in from individual sections, page fades as a whole */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Experience <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-600">MedASK AI</span> in Action
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how MedASK AI can help you understand your medications and explore natural remedies.
              </p>
            </div>
            
            <div className="w-full">
              <DemoExperience />
            </div>
          </div>
        </section>
        
        {/* Subscription Plans Section - Redesigned */}
        <section className="section-padding bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-600">Perfect Plan</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find the right subscription that fits your healthcare needs.
              </p>
              <div className="flex justify-center mt-4 mb-2">
                <button
                  className="px-8 py-3 bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-700 text-white font-semibold rounded-full shadow-md text-base md:text-lg transition-all duration-300 opacity-80 cursor-not-allowed hover:opacity-100 focus:outline-none border-0"
                  disabled
                >
                  Subscription Coming Soon
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-10 max-w-4xl mx-auto py-8 w-full">
              <Card className="flex flex-col justify-between items-center w-full max-w-md bg-white/70 backdrop-blur-md border border-purple-100 rounded-3xl shadow-xl p-10 mx-auto transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-400/20">
  <CardContent className="flex flex-col flex-grow items-center text-center w-full p-0">
                  <h3 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">Basic</h3>
                  <p className="text-gray-500 mb-4 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">Perfect for beginners exploring MedASK AI</p>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-gray-900 mb-2 block">Free</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">5 prescription upload per month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">10-day journal access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Limited AI Chat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Basic medicine explanations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Limited natural remedy suggestions</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full py-4 bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-700 text-white font-bold rounded-xl shadow-md mt-auto transition-all duration-300 hover:from-purple-500 hover:to-indigo-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    asChild
                  >
                    <Link to="/subscription">Start Free</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="relative flex flex-col justify-between items-center w-full max-w-md bg-white/80 backdrop-blur-md border-2 border-purple-400 rounded-3xl shadow-2xl p-10 mx-auto transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
  {/* Most Popular Badge */}
  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white text-xs font-bold uppercase tracking-wide py-2 px-6 rounded-full shadow-lg z-20 border-2 border-white/60">
    Most Popular
  </span>
  <CardContent className="flex flex-col flex-grow items-center text-center w-full p-0 pt-4">
                  
                  <h3 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">Standard</h3>
                  <p className="text-gray-500 mb-4 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">Unlocks all MedASK AI features.</p>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-gray-900 mb-2 block">$15</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Unlimited prescription uploads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Unlimited journal access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Unlimited AI Chat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-600">Unlimited natural remedy suggestions</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full py-4 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 text-white font-bold rounded-xl shadow-md mt-auto transition-all duration-300 hover:from-purple-600 hover:to-indigo-800 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    asChild
                  >
                    <Link to="/subscription">Subscribe Now</Link>
                  </Button>
                </CardContent>
              </Card>
              
              
            </div>
          </div>
        </section>
        
        <section className="section-padding bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Understand Your Medications?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of users who have gained clarity on their prescriptions and discovered natural alternatives.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="bg-white text-purple-700 px-8 py-6 text-lg hover:bg-gray-100 shadow-lg hover-scale"
                asChild
              >
                <Link to="/register">Get Started</Link>
              </Button>
              <Button 
                className="bg-white text-purple-700 px-8 py-6 text-lg hover:bg-gray-100 shadow-lg hover-scale"
                asChild
              >
                <Link to="/subscription">View Plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;