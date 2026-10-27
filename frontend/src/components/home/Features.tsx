
import React from 'react';
import { 
  Camera, 
  MessageSquare, 
  FileText, 
  Leaf, 
  BarChart
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => ( // Removed delay prop
  <div className={"feature-card hover-card-lift"}> {/* Removed animate-fade-in and delay class */}
    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-lg flex items-center justify-center text-white mb-4 shadow-md shadow-purple-500/10">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Top left blurred orb, matches Hero bottom left orb */}
      <div className="absolute top-[-140px] left-[-150px] w-[400px] h-[320px] rounded-[220px_200px_220px_200px] bg-gradient-to-br from-purple-400 via-indigo-300 to-purple-100 opacity-60 blur-[72px] pointer-events-none z-0 hidden md:block" />
            <div className="container mx-auto px-4">
        {/* Removed animate-fade-in from section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful <span className="gradient-text">AI-Powered</span> Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with medical expertise to provide you with clear understanding and natural alternatives.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Camera size={24} />} /* Removed animate-fade-in from icon */
            title="Prescription Upload"
            description="Simply upload a photo of your prescription, and our advanced OCR technology will extract all the necessary information."
            // Removed delay prop
          />
          
          <FeatureCard 
            icon={<FileText size={24} />} /* Removed animate-fade-in from icon */
            title="Medicine Explanation"
            description="Get detailed, easy-to-understand explanations of your medications, including usage, side effects, and precautions."
            // Removed delay prop
          />
          
          <FeatureCard 
            icon={<Leaf size={24} />} /* Removed animate-fade-in from icon */
            title="Natural Alternatives"
            description="Discover evidence-based natural remedies and lifestyle changes that can complement your prescribed medications."
            // Removed delay prop
          />
          
          <FeatureCard 
            icon={<MessageSquare size={24} />} /* Removed animate-fade-in from icon */
            title="AI Health Assistant"
            description="Chat with our AI assistant to get personalized answers to your health and medication questions."
            // Removed delay prop
          />
          
          <FeatureCard 
            icon={<BarChart size={24} />} /* Removed animate-fade-in from icon */
            title="Health Tracking"
            description="Keep a journal of your symptoms, medications, and progress to better manage your health journey."
            // Removed delay prop
          />
          
          {/* Removed animate-fade-in and delay from this special card */}
          <div className="feature-card hover-card-lift bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-md">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> {/* Removed animate-fade-in */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Privacy Protected</h3>
            <p>Your health data is encrypted and secure. We never share your personal information with third parties.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
