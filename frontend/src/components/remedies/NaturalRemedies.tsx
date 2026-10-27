
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Leaf, ThumbsUp, ThumbsDown, Plus, Check, ChevronRight } from 'lucide-react';

interface RemedyProps {
  name: string;
  description: string;
  benefits: string[];
  usage: string;
  effectiveness: number;
  image: string;
}

const sampleRemedies: RemedyProps[] = [
  {
    name: "Hibiscus Tea",
    description: "Hibiscus tea can help lower blood pressure by acting as a natural diuretic and ACE inhibitor.",
    benefits: [
      "May help lower blood pressure",
      "Rich in antioxidants",
      "Supports heart health"
    ],
    usage: "Drink 1-2 cups daily. Steep 1-2 teaspoons of dried hibiscus in hot water for 5-10 minutes.",
    effectiveness: 70,
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637d99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Potassium-Rich Foods",
    description: "Foods high in potassium help balance sodium levels and support healthy blood pressure.",
    benefits: [
      "Helps maintain electrolyte balance",
      "Supports proper heart function",
      "May reduce blood pressure"
    ],
    usage: "Include bananas, spinach, sweet potatoes, and avocados in your daily diet.",
    effectiveness: 85,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Regular Exercise",
    description: "Regular physical activity strengthens your heart and improves circulation.",
    benefits: [
      "Lowers blood pressure naturally",
      "Improves overall cardiovascular health",
      "Reduces stress and anxiety"
    ],
    usage: "Aim for at least 30 minutes of moderate exercise 5 days a week.",
    effectiveness: 90,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  }
];

import { toast } from '../ui/use-toast';

interface NaturalRemediesProps {
  demoMode?: boolean;
}

const NaturalRemedies: React.FC<NaturalRemediesProps> = ({ demoMode = false }) => {
  const [savedRemedies, setSavedRemedies] = useState<string[]>([]);
  const [expandedRemedy, setExpandedRemedy] = useState<string | null>(null);

  const toggleSaveRemedy = (remedyName: string) => {
    if (demoMode) {
      toast({ title: 'Demo mode', description: 'Action disabled.' });
      return;
    }
    if (savedRemedies.includes(remedyName)) {
      setSavedRemedies(savedRemedies.filter(name => name !== remedyName));
    } else {
      setSavedRemedies([...savedRemedies, remedyName]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-violet rounded-full flex items-center justify-center mr-3">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold">Natural Remedy Suggestions</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        These natural remedies may complement your prescribed medication. Always consult with your healthcare provider before making any changes to your treatment plan.
      </p>
      
      <div className="space-y-6">
        {sampleRemedies.map((remedy) => (
          <div 
            key={remedy.name}
            className="border rounded-xl overflow-hidden hover-card-lift"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-48 md:h-auto">
                <img 
                  src={remedy.image} 
                  alt={remedy.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4 md:p-6 md:w-2/3">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold">{remedy.name}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSaveRemedy(remedy.name)}
                  >
                    {savedRemedies.includes(remedy.name) ? (
                      <Check className="w-5 h-5 text-medask-primary" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500" />
                    )}
                  </Button>
                </div>
                
                <p className="text-gray-600 mt-2">{remedy.description}</p>
                
                <div className="mt-4">
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium mr-2">Effectiveness:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-violet h-2 rounded-full" 
                        style={{ width: `${remedy.effectiveness}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium ml-2">{remedy.effectiveness}%</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      <span>Helpful</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      <span>Not helpful</span>
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setExpandedRemedy(expandedRemedy === remedy.name ? null : remedy.name)}
                    className="text-medask-primary"
                  >
                    {expandedRemedy === remedy.name ? 'Show less' : 'Learn more'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                {expandedRemedy === remedy.name && (
                  <div className="mt-4 pt-4 border-t animate-fade-in">
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Benefits</h5>
                      <ul className="space-y-1">
                        {remedy.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-medask-primary rounded-full mr-2"></div>
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2">How to Use</h5>
                      <p className="text-gray-700">{remedy.usage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button className="bg-gradient-violet">
          View All Natural Remedies
        </Button>
      </div>
    </div>
  );
};

export default NaturalRemedies;
