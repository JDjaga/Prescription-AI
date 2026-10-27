import React from 'react';
import { MessageCircle, Upload, FileText, BookOpen } from 'lucide-react';

const DemoSection = () => {
  return (
    <section className="relative py-20 px-4 bg-white w-full flex flex-col items-center">
      <div className="absolute top-4 right-6 z-20 bg-yellow-300 text-yellow-900 text-sm px-4 py-1 rounded-full font-bold shadow-md border border-yellow-400 tracking-wide select-none" style={{letterSpacing: '0.05em'}}>DEMO ONLY</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {/* Medicine Explanation */}
        <div className="bg-white border border-gray-100 shadow-lg rounded-2xl flex flex-col items-center p-8">
          <FileText className="w-7 h-7 text-purple-500 mb-4" />
          <h3 className="font-semibold text-xl mb-2 text-gray-800">Medicine Explanation</h3>
          <p className="text-gray-500 mb-6 text-center text-base">Get clear, simple explanations for each medicine in your prescription. (Demo only)</p>
          <button
            disabled
            className="w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 text-gray-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed border border-gray-200 shadow-sm text-base"
          >
            Demo Only
          </button>
        </div>
        {/* Only one natural remedy, with image */}
        <div className="bg-white border border-gray-100 shadow-lg rounded-2xl flex flex-col items-center p-8">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80"
            alt="Turmeric Root"
            className="w-12 h-12 rounded-full object-cover border-2 border-pink-200 shadow mb-4"
          />
          <h3 className="font-semibold text-xl mb-2 text-gray-800">Natural Remedy: Turmeric</h3>
          <p className="text-gray-500 mb-6 text-center text-base">Turmeric contains curcumin, which has anti-inflammatory properties. It may help support joint and overall health. (Demo only)</p>
          <button
            disabled
            className="w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 text-gray-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed border border-gray-200 shadow-sm text-base"
          >
            Demo Only
          </button>
        </div>
        {/* Health Journal */}
        <div className="bg-white border border-gray-100 shadow-lg rounded-2xl flex flex-col items-center p-8 md:col-span-1">
          <BookOpen className="w-7 h-7 text-emerald-500 mb-4" />
          <h3 className="font-semibold text-xl mb-2 text-gray-800">Health Journal</h3>
          <p className="text-gray-500 mb-6 text-center text-base">Log your health journey and track your progress. (Demo only)</p>
          <button
            disabled
            className="w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 text-gray-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed border border-gray-200 shadow-sm text-base"
          >
            Demo Only
          </button>
        </div>
        {/* Modern chat rectangle card, no recommendations, no scan result button */}
        <div className="md:col-span-3 flex justify-center">
          <div className="bg-white border border-gray-100 shadow-lg rounded-2xl flex flex-col items-center p-8 w-full max-w-xl mt-8">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-7 h-7 text-yellow-500 mr-2" />
              <span className="font-semibold text-xl text-gray-800">AI Chat Demo</span>
            </div>
            <div className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 text-gray-700 mb-2 text-base">
              <span className="font-medium text-purple-700">You:</span> What does my prescription mean?
            </div>
            <div className="w-full bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 border border-purple-100 rounded-lg p-4 text-gray-800 mb-2 text-base">
              <span className="font-medium text-indigo-700">MedASK AI:</span> Your prescription for Lisinopril (10mg) helps control blood pressure by relaxing blood vessels.
            </div>
            <input
              type="text"
              placeholder="Type your question..."
              disabled
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-4 focus:outline-none text-gray-400 cursor-not-allowed"
            />
            <button
              disabled
              className="mt-3 w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 text-gray-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed border border-gray-200 shadow-sm text-base"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
