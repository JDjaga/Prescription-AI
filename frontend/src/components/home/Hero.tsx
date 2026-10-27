
import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, MessageCircle, Sparkles } from 'lucide-react';
// import Hero3DGraphics from './Hero3DGraphics';
import '../../hero3d.css';

const Hero = () => (
  <section data-hero className="relative w-full min-h-[80vh] flex items-center justify-center px-4 pb-8 pt-10 md:pt-0 overflow-hidden bg-white">

    {/* 3D graphics removed as requested */}
  {/* Blended violet cloud background, mostly behind prescription headline */}
  <div className="absolute inset-0 z-0 pointer-events-none">
    {/* Top right elliptical blue/teal orb */}
    <div className="absolute top-[-80px] right-[-100px] w-[370px] h-[220px] rounded-[180px_220px_180px_220px] bg-gradient-to-br from-purple-500 via-indigo-400 to-purple-200 opacity-70 blur-3xl hidden md:block" />
    {/* Bottom left circular pink/orange orb */}
    <div className="absolute bottom-[-120px] left-[-150px] w-[400px] h-[320px] rounded-[220px_200px_220px_200px] bg-gradient-to-br from-purple-400 via-indigo-300 to-purple-100 opacity-60 blur-[72px] z-0 hidden md:block" />
  </div>

  
    <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-4 md:mt-8">
      {/* Left: Headline and Actions */}
      <div className="w-full flex flex-col items-start justify-center z-10">
        <h1 className="text-3xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight text-center md:text-left tracking-tight">
  Understand Your <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-700 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Prescriptions</span> With AI
</h1>
        <p className="text-lg text-gray-600 mb-9 max-w-xl text-left">
          MedASK AI simplifies medical jargon and offers natural alternatives to complement your treatment. Upload your prescription now and gain clarity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/upload" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-base font-semibold rounded-lg shadow-md bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-700 hover:brightness-110 hover:scale-105 hover:shadow-lg transition-transform transition-shadow duration-200 text-white flex items-center gap-2">
              <Upload className="w-5 h-5 mr-1" /> Upload Prescription
            </Button>
          </Link>
          <Link to="/chat" className="w-full sm:w-auto">
            <Button
  size="lg"
  className="w-full sm:w-auto px-8 py-3 text-base font-semibold rounded-xl border border-[#b97aff] text-[#b97aff] bg-white hover:bg-white hover:border-[#a259f7] hover:text-[#a259f7] hover:scale-105 hover:shadow-lg transition-transform transition-shadow duration-200 shadow-none flex items-center gap-2 transition-colors"
>
  <MessageCircle className="w-5 h-5 mr-1" /> Chat with AI
</Button>
          </Link>
        </div>
      </div>
      {/* Right: Chat Demo Card */}
      <div className="w-full flex items-center justify-center relative">
        {/* Faint purple glow/shadow behind card */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-md h-72 md:h-80 blur-2xl rounded-3xl bg-purple-300 opacity-20"></div>
        </div>
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-lg p-8 flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-3 mb-1">
  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-full flex items-center justify-center">
    <Sparkles className="w-5 h-5 text-white" />
  </div>
  <span className="font-semibold text-lg text-gray-900">MedASK AI Assistant</span>
</div>
          {/* AI message */}
          <div className="bg-gray-50 rounded-lg p-4 text-gray-900 text-base shadow-sm border border-gray-100">
  Your prescription for Lisinopril (10mg) helps control high blood pressure by relaxing blood vessels.
</div>
          {/* User message */}
          <div className="bg-purple-50 rounded-2xl p-4 text-purple-900 text-base border border-purple-100">
  Are there any natural alternatives I can use alongside this medicine?
</div>
          {/* AI reply */}
          <div className="bg-gray-50 rounded-lg p-4 text-gray-900 text-base shadow-sm border border-gray-100">
  Yes! Consider these natural supplements: potassium-rich foods, hibiscus tea, and regular exercise. These can complement your medication but always consult with your doctor first.
</div>
          {/* Input (disabled) */}
          <div className="flex items-center gap-2 mt-2">
  <input
    type="text"
    placeholder="Ask about your medication..."
    disabled
    className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2 text-gray-400 cursor-not-allowed"
  />
  <button
    disabled
    className="bg-purple-500 text-white h-10 w-10 rounded-full flex items-center justify-center opacity-60 cursor-not-allowed"
    aria-label="Send message (disabled demo)"
  >
    <ArrowRight className="w-5 h-5" />
  </button>
</div>
          <span className="text-xs text-gray-400 mt-2">Visit the AI Chat page for a full conversation</span>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
