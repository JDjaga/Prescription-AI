
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import HealthJournal from '../components/journal/HealthJournal';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { LineChart, Scroll, Edit3, Eye, FileText, X, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../supabaseClient';

type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

interface JournalEntry {
  id: string; // UUID, matches journal_entries table
  date: Date;
  symptoms: string[];
  medications: string[];
  notes: string;
  mood: Mood;
}

// This is for the data being collected in the dialog, before an ID is assigned
interface JournalEntryData {
  date: Date;
  symptoms: string[];
  medications: string[];
  notes: string;
  mood: Mood;
}

const moodEmojis: Record<Mood, string> = {
  great: '😁',
  good: '🙂',
  okay: '😐',
  bad: '😔',
  terrible: '😣',
};

const initialDialogData: JournalEntryData = {
  date: new Date(),
  symptoms: [],
  medications: [],
  notes: '',
  mood: 'good',
};

const Journal = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [currentDialogEntry, setCurrentDialogEntry] = useState<JournalEntryData>(initialDialogData);
  const [currentSymptomInput, setCurrentSymptomInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user id from Supabase auth session
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  // Fetch entries for user
  useEffect(() => {
    if (!userId) return;
    const fetchEntries = async () => {
      try {
        // Always use /api/journal/:userId endpoint, which is correct and handled by backend journalRoutes.js using 'journal_entries' table
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/journal/${userId}`);
        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }
        const json = await res.json();
        if (json.success) {
          setEntries(json.entries.map((e: any) => ({
            ...e,
            date: e.date ? new Date(e.date) : new Date(),
            medications: e.medications ? (Array.isArray(e.medications) ? e.medications : (typeof e.medications === 'string' ? e.medications.split('\n') : [])) : [],
            symptoms: Array.isArray(e.symptoms) ? e.symptoms : (typeof e.symptoms === 'string' ? e.symptoms.split(',') : []),
          })));
        } else {
          toast({ variant: 'destructive', title: 'Failed to load entries', description: json.message });
        }
      } catch (err: any) {
        console.error('Failed to fetch journal entries:', err);
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
    };
    fetchEntries();
  }, [userId]);

  const handleAddSymptom = () => {
    if (currentSymptomInput.trim() !== '' && !currentDialogEntry.symptoms.includes(currentSymptomInput.trim())) {
      setCurrentDialogEntry(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, currentSymptomInput.trim()]
      }));
      setCurrentSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptomToRemove: string) => {
    setCurrentDialogEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(symptom => symptom !== symptomToRemove)
    }));
  };
  
  const handleSaveNewEntry = async () => {
    if (currentDialogEntry.notes.trim() === "" && currentDialogEntry.symptoms.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please add some notes or at least one symptom before saving.",
      });
      return;
    }
    if (!userId) {
      toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to save entries." });
      return;
    }
    try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/journal/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          date: currentDialogEntry.date.toISOString().slice(0, 10),
          mood: currentDialogEntry.mood,
          symptoms: currentDialogEntry.symptoms,
          medications: currentDialogEntry.medications.join('\n'),
          notes: currentDialogEntry.notes,
        }),
      });
      let json;
      if (res.ok) {
        try {
          json = await res.json();
        } catch (err) {
          toast({
            variant: 'destructive',
            title: 'Server Error',
            description: 'Received empty or invalid response from server. Please check backend logs.'
          });
          console.error('Error parsing JSON response:', err);
          return;
        }
      } else {
        const text = await res.text();
        toast({
          variant: 'destructive',
          title: 'Server Error',
          description: `Failed to save entry: ${res.status} ${res.statusText}`
        });
        console.error('Non-200 response:', res.status, res.statusText, text);
        return;
      }
      if (json.success) {
        setEntries(prev => [
          {
            ...json.entry,
            date: new Date(json.entry.date),
            medications: json.entry.medications ? (Array.isArray(json.entry.medications) ? json.entry.medications : json.entry.medications.split('\n')) : [],
            symptoms: Array.isArray(json.entry.symptoms) ? json.entry.symptoms : [],
          },
          ...prev
        ]);
        toast({ title: "Entry Saved", description: "Your journal entry has been successfully saved.", className: "bg-green-100 border-green-300 text-green-700" });
        setCurrentDialogEntry(initialDialogData);
        setCurrentSymptomInput("");
        setIsNewEntryDialogOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Failed to save entry', description: json.message });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  // Reset dialog form when it's closed (not just on save)
  useEffect(() => {
    if (!isNewEntryDialogOpen) {
      setCurrentDialogEntry(initialDialogData);
      setCurrentSymptomInput("");
    }
  }, [isNewEntryDialogOpen]);

  // Function to be called by HealthJournal's "Create First Entry" button
  const openNewEntryDialog = () => {
    setIsNewEntryDialogOpen(true);
  }

  // const handleTrackNowClick = () => { ... };
  // const handleNewEntryFormToggled = (isOpen: boolean) => { ... };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      {/* Apply a single fade-in to the main content area of the page */}
      <main className="flex-grow animate-opacity-fade-in">
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Removed animate-fade-in from this header block, page fades in as a whole */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-block bg-purple-100 p-3 rounded-full mb-4">
                <Scroll className="w-8 h-8 text-medask-primary animate-pulse-custom" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                Your Health <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-600">Journal</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Track your symptoms, medications, and progress to gain insights into your health journey.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Removed individual card animations, min-height kept for stability */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover-card-lift flex flex-col min-h-[220px] md:min-h-[240px]">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white mb-4 shadow-md">
                    <LineChart className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Daily Tracking</h3>
                  <p className="text-gray-600 mb-4">
                    Record your symptoms, medication intake, and how you're feeling each day.
                  </p>
                  <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 mt-auto"
                        // onClick is now handled by DialogTrigger
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        New Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto px-2 py-4 sm:px-8 sm:py-8 rounded-xl">
                      <DialogHeader>
                        <DialogTitle>New Journal Entry</DialogTitle>
                        <DialogDescription>
                          Log your daily health status. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4"> {/* Increased gap */}
                        {/* Date Input */}
                        <div>
                          <Label htmlFor="entryDate" className="text-sm font-medium">Date</Label>
                          <Input 
                            id="entryDate"
                            type="date" 
                            value={currentDialogEntry.date.toISOString().split('T')[0]}
                            onChange={(e) => setCurrentDialogEntry({
                              ...currentDialogEntry, 
                              date: new Date(e.target.value + 'T00:00:00') // Ensure time is considered for correct date
                            })}
                            className="mt-1"
                          />
                        </div>

                        {/* Mood Selection */}
                        <div>
                          <Label className="block text-sm font-medium mb-2">How are you feeling today?</Label>
                          <div className="flex justify-around items-center gap-1 flex-wrap">
                            {(Object.keys(moodEmojis) as Mood[]).map(mood => (
                              <button 
                                key={mood}
                                type="button"
                                onClick={() => setCurrentDialogEntry({...currentDialogEntry, mood})}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-150 w-16 h-16 justify-center ${
                                  mood === currentDialogEntry.mood 
                                    ? 'bg-purple-100 ring-2 ring-purple-500 shadow-md' 
                                    : 'hover:bg-gray-100'
                                }`}
                                title={mood.charAt(0).toUpperCase() + mood.slice(1)}
                              >
                                <span className="text-2xl">{moodEmojis[mood]}</span>
                                <span className="text-xs mt-1 capitalize">{mood}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Symptoms Input */}
                        <div>
                          <Label htmlFor="symptoms" className="text-sm font-medium">Symptoms</Label>
                          <div className="flex mt-1">
                            <Input 
                              id="symptoms"
                              type="text" 
                              value={currentSymptomInput}
                              onChange={(e) => setCurrentSymptomInput(e.target.value)}
                              placeholder="e.g., Headache, Fatigue"
                              className="rounded-r-none"
                            />
                            <Button 
                              onClick={handleAddSymptom}
                              className="rounded-l-none bg-purple-600 hover:bg-purple-700"
                              type="button"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {currentDialogEntry.symptoms.map((symptom, index) => (
                              <div 
                                key={index}
                                className="bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 text-sm flex items-center"
                              >
                                <span className="mr-2">{symptom}</span>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveSymptom(symptom)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            {currentDialogEntry.symptoms.length === 0 && (
                              <span className="text-gray-500 text-sm italic px-1">No symptoms added yet.</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Medications Input */}
                        <div>
                           <Label htmlFor="medications" className="text-sm font-medium">Medications Taken</Label>
                           <Textarea
                            id="medications"
                            placeholder="e.g., Lisinopril 10mg, Vitamin D..."
                            value={currentDialogEntry.medications.join('\n')} // Join array for display
                            onChange={(e) => setCurrentDialogEntry({
                                ...currentDialogEntry,
                                medications: e.target.value.split('\n').map(m => m.trim()).filter(m => m !== '') // Split back to array
                            })}
                            className="mt-1 min-h-[60px]"
                          />
                        </div>

                        {/* Notes Textarea */}
                        <div>
                          <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any other details, observations, or feelings..."
                            value={currentDialogEntry.notes}
                            onChange={(e) => setCurrentDialogEntry({...currentDialogEntry, notes: e.target.value})}
                            className="mt-1 min-h-[100px]"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewEntryDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveNewEntry} className="bg-purple-600 hover:bg-purple-700">Save Entry</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover-card-lift flex flex-col min-h-[220px] md:min-h-[240px]">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white mb-4 shadow-md">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Visualize Progress</h3>
                  <p className="text-gray-600 mb-4">
                    See how your symptoms and health metrics change over time with visual charts.
                  </p>
                  <Button className="w-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 mt-auto" asChild>
                    <Link to="/journal/visualize">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualize
                    </Link>
                  </Button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover-card-lift flex flex-col min-h-[220px] md:min-h-[240px]">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white mb-4 shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Health Reports</h3>
                  <p className="text-gray-600 mb-4">
                    Generate comprehensive reports to share with your healthcare providers.
                  </p>
                  <Button className="w-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 mt-auto" asChild>
                    <Link to="/journal/report">
                      <FileText className="w-4 h-4 mr-2" />
                      View Reports
                    </Link>
                  </Button>
                </div>
              </div>
              
              <HealthJournal 
                entries={entries}
                moodEmojis={moodEmojis}
                onOpenNewEntryDialog={openNewEntryDialog}
                onDeleteEntry={async (id: string) => {
  console.log('Requesting delete for entry id:', id);
  if (!id) return;
  if (!window.confirm('Are you sure you want to delete this entry?')) return;
  try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/journal/delete/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) {
      toast({ variant: 'destructive', title: 'Delete failed', description: json.message });
    } else {
      setEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Entry deleted', className: 'bg-green-100 border-green-300 text-green-700' });
    }
  } catch (error: any) {
    toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
  }
}}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Journal;
