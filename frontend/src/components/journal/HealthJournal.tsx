
import React from 'react'; // Removed useState, useEffect as they are no longer needed here
import { Button } from '../ui/button';
import { Plus, Calendar, Book, AlertCircle, LineChart } from 'lucide-react'; // X is no longer needed here

// Types are now expected to be defined in or imported by the parent (Journal.tsx)
type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

interface JournalEntry {
  id: string;
  date: Date;
  symptoms: string[];
  medications: string[];
  notes: string;
  mood: Mood;
}

import { toast } from '../ui/use-toast';

interface HealthJournalProps {
  demoMode?: boolean;
  entries: JournalEntry[];
  moodEmojis: Record<Mood, string>;
  onOpenNewEntryDialog: () => void; // Callback to open the dialog in the parent
  onDeleteEntry: (id: string) => void; // Callback to delete entry in the parent
}

const HealthJournal: React.FC<HealthJournalProps> = ({ 
  entries = [], // Provide a default empty array
  moodEmojis,
  onOpenNewEntryDialog,
  onDeleteEntry,
  demoMode = false
}) => {

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-violet rounded-full flex items-center justify-center mr-3">
            <Book className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold">Health Journal</h3>
        </div>
        {/* The main "New Entry" button is now in Journal.tsx (triggering the dialog) */}
      </div>
      
      {/* Form for new entry has been removed from here and is now in a dialog in Journal.tsx */}
      
      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map(entry => (
            <div key={entry.id} className="border rounded-lg overflow-hidden hover-card-lift">
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-medask-secondary mr-2" />
                  <span className="font-medium">{formatDate(entry.date)}</span>
                </div>
                <div className="text-2xl flex items-center gap-2">
                  {moodEmojis[entry.mood]}
                  <button
                    className="ml-1 text-gray-400 hover:text-red-600 opacity-70 hover:opacity-100 transition"
                    title="Delete entry"
                    onClick={() => {
  if (demoMode) {
    toast({ title: 'Demo mode', description: 'Action disabled.' });
    return;
  }
  onDeleteEntry(entry.id);
}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <h5 className="font-medium text-sm text-gray-500 mb-2">Symptoms</h5>
                  <div className="flex flex-wrap gap-2">
                    {entry.symptoms.length > 0 ? entry.symptoms.map((symptom, idx) => (
                      <span key={idx} className="bg-red-50 text-red-600 rounded-full px-3 py-1 text-sm">
                        {symptom}
                      </span>
                    )) : (
                      <span className="text-gray-500">None reported</span>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="font-medium text-sm text-gray-500 mb-2">Medications Taken</h5>
                  <div className="flex flex-wrap gap-2">
                    {entry.medications.map((medication, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-sm">
                        {medication}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm text-gray-500 mb-2">Notes</h5>
                  <p className="text-gray-700">{entry.notes}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <LineChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No entries yet</h4>
            <p className="text-gray-500 mb-4">Start tracking your health by creating your first journal entry</p>
            <Button 
              onClick={onOpenNewEntryDialog} // Use the callback to open dialog in parent
              className="bg-gradient-violet"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Entry
            </Button>
          </div>
        )}
      </div>
      

    </div>
  );
};

export default HealthJournal;
