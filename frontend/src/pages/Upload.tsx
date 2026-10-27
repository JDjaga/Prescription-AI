
import React from 'react';
import Navbar from '../components/layout/Navbar';
import PrescriptionUpload from '../components/upload/PrescriptionUpload';
import { Upload as UploadIcon, FileText } from 'lucide-react';

const Upload = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 animate-opacity-fade-in">
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Removed individual animate-fade-in and delays from header elements */}
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="inline-block bg-medask-light bg-opacity-30 p-3 rounded-full mb-4">
                <UploadIcon className="w-8 h-8 text-medask-primary animate-pulse-custom" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                Upload Your <span className="gradient-text">Prescription</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Let MedASK AI analyze your prescription and provide you with a clear understanding of your medications.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <PrescriptionUpload />
              
              {/* Removed animate-fade-in and delay from this card */}
              <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover-card-lift">
                <h3 className="text-xl font-semibold mb-6">What happens after you upload?</h3>
                <div className="space-y-6">
                  {/* Removed animate-fade-in and delays from these list items */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0 shadow-md">
                      <span className="font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">AI Analysis</h4>
                      <p className="text-gray-600">Our AI reads and processes your prescription, identifying medications and dosages with precision.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0 shadow-md">
                      <span className="font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Easy-to-Understand Explanations</h4>
                      <p className="text-gray-600">We break down each medication into clear information about usage, side effects, and precautions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0 shadow-md">
                      <span className="font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Natural Remedy Suggestions</h4>
                      <p className="text-gray-600">Receive science-backed natural alternatives that can complement your prescribed treatment.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0 shadow-md">
                      <span className="font-semibold">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Personalized Health Plan</h4>
                      <p className="text-gray-600">Get a customized plan that incorporates both your prescribed medications and complementary natural approaches.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Upload;
