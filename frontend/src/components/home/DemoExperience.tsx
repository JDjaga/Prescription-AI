import React from 'react';
import { Sparkles, Upload, MessageCircle, FileText, HeartPulse, BookOpen } from 'lucide-react';

import { Link } from 'react-router-dom';

const demoFeatures = [
  {
    icon: <Upload className="w-7 h-7 text-indigo-500" />,
    title: 'Upload Prescription',
    desc: 'Upload your prescription and see how MedASK AI extracts and explains your medicines.',
    button: { label: 'Upload', to: '/upload' },
  },
  {
    icon: <FileText className="w-7 h-7 text-purple-500" />,
    title: 'Medicine Explanation',
    desc: 'Get clear, simple explanations for each medicine in your prescription.',
    button: { label: 'Explain', to: '/upload' },
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 21c6-6 13-10 13-10s-4 7-10 13c0 0-1-1-3-3z" /></svg>,
    title: 'Natural Remedies',
    desc: 'Discover safe, science-backed natural remedies that support your health and well-being.',
    button: { label: 'Remedies', to: '/natural-remedies' },
  },
  {
    icon: <BookOpen className="w-7 h-7 text-emerald-500" />,
    title: 'Health Journal',
    desc: 'Log your health journey and track your progress.',
    button: { label: 'Journal', to: '/journal' },
  }
];

const DemoExperience = () => {
  return (
    <section className="relative py-8 sm:py-12 px-2 sm:px-6 bg-transparent w-full flex flex-col items-center overflow-x-clip">
      {/* Subtle, professional background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[280px] bg-gradient-to-br from-purple-100 via-indigo-50 to-white opacity-30 blur-2xl rounded-3xl z-0 pointer-events-none" />
      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-6xl mx-auto rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/60 shadow-2xl flex flex-col items-center px-2 sm:px-4 md:px-8 py-6 md:py-10 justify-center">
        <div className="relative w-full flex flex-col items-center pb-0">
          {/* Section-wide subtle gradient background for cards */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[90vw] max-w-5xl h-full rounded-3xl bg-gradient-to-br from-purple-100 via-indigo-50 to-white opacity-60 blur-md" />
          </div>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl py-2 place-items-stretch">
            {demoFeatures.map((feature, idx) => (
              <div key={feature.title} className="bg-white/90 backdrop-blur rounded-3xl border border-purple-300 shadow-[0_4px_32px_rgba(125,80,255,0.08)] flex flex-col items-center justify-between w-full flex-1 p-6 text-center transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-center w-full h-[56px] mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-xl mb-2 text-gray-900 tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 mb-6 text-center text-base flex-1">{feature.desc}</p>
                <div className="flex-grow" />
                <Link
                  to={feature.button.to}
                  className="w-full mt-auto bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-lg border border-purple-500 shadow transition-all duration-200 text-base text-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                >
                  {feature.button.label}
                </Link>
              </div>
            ))}
            {/* Chat card as a grid item for perfect alignment */}
            <div className="bg-white/95 backdrop-blur-xl border border-purple-300 shadow-[0_4px_32px_rgba(125,80,255,0.08)] rounded-3xl flex flex-col items-start p-6 min-h-[180px] w-full transition-all duration-200 col-span-full">
              <div className="flex items-center mb-4">
                <MessageCircle className="w-7 h-7 text-yellow-500 mr-2" />
              </div>
              <div className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 text-gray-700 mb-2 text-base">
                <span className="font-medium text-purple-700">You:</span> What does my prescription mean?
              </div>
              <div className="w-full bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 border border-purple-100 rounded-lg p-4 text-gray-800 mb-2 text-base">
                <span className="font-medium text-indigo-700">MedASK AI:</span> Your prescription for Lisinopril (10mg) helps control blood pressure by relaxing blood vessels.
              </div>
              <div className="flex-grow" />
              <Link
                to="/chat"
                className="mt-5 w-full bg-gradient-to-br from-purple-600 via-indigo-500 to-purple-700 text-white font-semibold py-3 px-6 rounded-lg border border-purple-600 shadow transition-all duration-200 text-base text-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
              >
                Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoExperience;
