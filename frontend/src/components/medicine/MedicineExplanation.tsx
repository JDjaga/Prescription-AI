
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertCircle, ChevronDown, ChevronUp, ExternalLink, Pill, Clock, AlertTriangle } from 'lucide-react';

interface MedicineDetailsProps {
  name: string;
  description: string;
  dosage: string;
  frequency: string;
  sideEffects: string[];
  warnings: string[];
}

const sampleMedicine: MedicineDetailsProps = {
  name: "Lisinopril 10mg",
  description: "Lisinopril is an ACE inhibitor that helps relax blood vessels, which lowers blood pressure and increases blood and oxygen flow.",
  dosage: "10mg",
  frequency: "Once daily, in the morning",
  sideEffects: [
    "Dry cough",
    "Dizziness",
    "Headache",
    "Fatigue",
    "Nausea"
  ],
  warnings: [
    "Do not take if pregnant",
    "May cause elevated potassium levels",
    "Use caution when exercising or in hot weather",
    "Avoid salt substitutes containing potassium"
  ]
};

import { toast } from '../ui/use-toast';

interface MedicineExplanationProps {
  demoMode?: boolean;
}

const MedicineExplanation: React.FC<MedicineExplanationProps> = ({ demoMode = false }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-violet rounded-full flex items-center justify-center mr-4">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{sampleMedicine.name}</h3>
              <p className="text-sm text-gray-600">ACE Inhibitor</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (demoMode) {
                toast({ title: 'Demo mode', description: 'Action disabled.' });
                return;
              }
              setExpanded(!expanded);
            }}
            className="hover:bg-medask-light hover:bg-opacity-20"
          >
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-700">{sampleMedicine.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-medask-secondary mb-1">
              <Pill className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Dosage</span>
            </div>
            <p className="text-gray-800 font-medium">{sampleMedicine.dosage}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-medask-secondary mb-1">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Frequency</span>
            </div>
            <p className="text-gray-800 font-medium">{sampleMedicine.frequency}</p>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div>
              <h4 className="text-lg font-semibold mb-2">Possible Side Effects</h4>
              <ul className="space-y-2">
                {sampleMedicine.sideEffects.map((effect, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-medask-primary rounded-full mr-2"></div>
                    <span className="text-gray-700">{effect}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                Warnings & Precautions
              </h4>
              <ul className="space-y-2">
                {sampleMedicine.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full justify-between">
                <span>Learn more about Lisinopril</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineExplanation;
