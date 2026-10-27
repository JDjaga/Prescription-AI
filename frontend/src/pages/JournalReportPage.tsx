import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import { Button } from '../components/ui/button';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { DayPicker, DateRange } from 'react-day-picker';
import { FileText, CalendarDays, Smile, Activity, ListChecks, AlertTriangle, BarChart3, Info, Trash2 } from 'lucide-react'; // Added BarChart3, Info, Trash2
import { format, subDays, isValid, parseISO } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts'; // Added Recharts imports
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'; // Added Recharts types
import 'react-day-picker/dist/style.css';

interface JournalEntry {
  id?: string;
  date: string; 
  symptoms: { [symptomName: string]: number };
  mood: number; 
  notes?: string;
  medications?: string[];
}

import { supabase } from '../supabaseClient';

const moodEmojis: { [key: number]: string } = {
  1: '😣', // terrible
  2: '😔', // bad
  3: '😐', // okay
  4: '🙂', // good
  5: '😁', // great
};

// --- JournalReportPage will fetch real data below ---

const JournalReportPage = () => {
  // Delete handler
  const handleDeleteEntry = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      // Use Supabase client to delete
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
      if (error) {
        alert('Failed to delete entry: ' + error.message);
        return;
      }
      setJournalData(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert('Error deleting entry: ' + err.message);
    }
  }
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [userId, setUserId] = useState<string | null>(null);
  const [journalData, setJournalData] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  // Filter journalData by selected date range
  const reportData = useMemo(() => {
    if (!journalData || !Array.isArray(journalData)) return [];
    if (!reportDateRange?.from || !reportDateRange?.to) return journalData;
    const startDate = reportDateRange.from;
    const endDate = reportDateRange.to;
    const filteredEntries = journalData.filter(entry => {
      // Compare only the YYYY-MM-DD part, ignoring time and timezone
      const entryDateStr = typeof entry.date === 'string'
        ? entry.date.split('T')[0]
        : new Date(entry.date).toISOString().split('T')[0];
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      return entryDateStr >= startStr && entryDateStr <= endStr;
    });
    return filteredEntries;
  }, [journalData, reportDateRange]);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/journal/${userId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.entries)) {
          // Accept all valid entries, convert symptoms array to object, and map mood strings to numbers
          const MOOD_MAP: Record<string, number> = {
            'terrible': 1,
            'bad': 2,
            'okay': 3,
            'good': 4,
            'great': 5
          };
          const entries: JournalEntry[] = json.entries.map((e: Record<string, unknown>) => {
            // Convert symptoms array to object for chart logic
            let symptomsObj: { [symptom: string]: number } = {};
            if (Array.isArray(e.symptoms)) {
              (e.symptoms as string[]).forEach((sym: string) => {
                if (sym && typeof sym === 'string') symptomsObj[sym] = 1;
              });
            } else if (typeof e.symptoms === 'object' && e.symptoms !== null) {
              symptomsObj = e.symptoms as { [symptom: string]: number };
            }
            // Map mood string to number if necessary
            let moodNum = typeof e.mood === 'number' ? e.mood : (MOOD_MAP[(e.mood as string)?.toLowerCase?.()] || 0);
            return {
              id: typeof e.id === 'string' ? e.id : undefined,
              date: typeof e.date === 'string' ? e.date : new Date(e.date as string).toISOString().slice(0, 10),
              symptoms: symptomsObj,
              mood: moodNum,
              notes: typeof e.notes === 'string' ? e.notes : '',
              medications: Array.isArray(e.medications) ? e.medications as string[] : (typeof e.medications === 'string' ? (e.medications as string).split('\n') : []),
            };
          });
          setJournalData(entries);
        } else {
          setError(json.message || 'Failed to load journal entries');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  const summaryStats = useMemo(() => {
    if (reportData.length === 0) {
      if (journalData.length > 0) {
        console.warn('No reportData for summaryStats, but journalData is non-empty:', journalData);
      }
      return { avgMood: 0, frequentSymptoms: [], totalEntries: 0 };
    }
    const avgMood = reportData.reduce((sum, e) => sum + (typeof e.mood === 'number' ? e.mood : 0), 0) / reportData.length;
    const symptomCounts: Record<string, number> = {};
    reportData.forEach(e => {
      if (e.symptoms && typeof e.symptoms === 'object') {
        Object.keys(e.symptoms).forEach(symptom => {
          if (e.symptoms[symptom]) {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
          }
        });
      }
    });
    const frequentSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);
    return {
      avgMood,
      frequentSymptoms,
      totalEntries: reportData.length,
    };
  }, [reportData, journalData]);

  const chartData = useMemo(() => {
    return reportData.map(entry => ({
      date: format(parseISO(entry.date), 'MMM d'),
      mood: entry.mood,
    })).reverse(); // Reverse for chronological order in charts
  }, [reportData]);

  // CustomTooltip must be defined as a function expression after hooks
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-2 shadow-lg rounded-md border border-gray-200">
          <p className="label text-xs font-medium text-gray-700">{`Date: ${label}`}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="text-xs">
              {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-lg text-gray-700">Loading your journal report...</div>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-red-600 text-lg font-semibold">{error}</div>
        </main>
      </div>
    );
  }
  // Only one top-level return
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <button
        onClick={() => window.location.href = '/journal'}
        className="absolute top-16 left-4 z-20 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-blue-50 transition p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Back to Journal"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <main className="flex-grow animate-opacity-fade-in">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Journal Report</h1>

          {/* Date Range Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="shadow-lg hover-card-lift">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2 text-indigo-600" />
                  Date Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="report-date-range-filter"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      {reportDateRange?.from ?
                        (reportDateRange.to
                          ? `${format(reportDateRange.from, 'MMM dd, yyyy')} - ${format(reportDateRange.to, 'MMM dd, yyyy')}`
                          : format(reportDateRange.from, 'MMM dd, yyyy'))
                        : <span>Pick a date range</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="range"
                      selected={reportDateRange}
                      onSelect={setReportDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          </div>

          {/* Fallback if no data */}
          {!loading && !error && reportData.length === 0 && (
            <div className="text-center text-red-600 font-semibold my-8">
              No entries found for the selected date range.
            </div>
          )}

          {/* Summary Statistics */}
          {reportData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 md:mb-12">
              <Card className="shadow-lg hover-card-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Mood</CardTitle>
                  <Smile className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    {summaryStats.avgMood} 
                  </div>
                  <div className="text-xs text-gray-500">(1 = terrible, 5 = great)</div>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover-card-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Most Frequent Symptoms</CardTitle>
                  <Activity className="h-5 w-5 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <ul className="text-base text-gray-800 font-semibold">
                    {summaryStats.frequentSymptoms.length > 0 ? summaryStats.frequentSymptoms.map(symptom => (
                      <li key={symptom}>{symptom}</li>
                    )) : <li>No symptoms reported</li>}
                  </ul>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover-card-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
                  <ListChecks className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{summaryStats.totalEntries}</div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Recent Entries List */}
          {reportData.length > 0 && (
            <Card className="mb-8 md:mb-12 shadow-lg hover-card-lift">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Recent Entries
                </CardTitle>
                <CardDescription>Showing your most recent journal entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-gray-200">
                  {reportData.slice(0, 5).map(entry => (
                    <li key={entry.id || entry.date} className="py-4 group hover:bg-gray-50 transition">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                          {moodEmojis[entry.mood] || '😐'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 flex items-center">
                            {format(parseISO(entry.date), 'MMM d, yyyy')}
                            <button
                              className="ml-2 text-gray-400 hover:text-red-600 opacity-70 hover:opacity-100 transition"
                              title="Delete entry"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">Mood: {entry.mood}</div>
                          <div className="text-xs text-gray-500">Symptoms: {Object.keys(entry.symptoms).filter(k => entry.symptoms[k]).join(', ') || 'None'}</div>
                          {entry.medications && entry.medications.length > 0 && (
                            <div className="text-xs text-gray-500">Medications: {entry.medications.join(', ')}</div>
                          )}
                          {entry.notes && 
                            <div>
                              <strong className="text-xs font-medium text-gray-500">Notes:</strong>
                              <p className="text-xs text-gray-700 italic ml-1 whitespace-pre-line">{entry.notes}</p>
                            </div>
                          }
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {(reportData as any)._filteringSkipped ? (
                  <div className="text-yellow-600 text-center font-semibold text-base mb-6 flex items-center justify-center gap-2">
                    <Info className="inline-block w-5 h-5 mr-1" />
                    Date filtering was skipped due to a data format issue. Showing all your entries.
                  </div>
                ) : null}
                {reportData.length > 3 && (
                    <div className="text-center mt-6">
                      <Button variant="outline" size="sm" className="text-purple-600 border-purple-400 hover:bg-purple-50">
                        View All Entries (Conceptual)
                      </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mini Mood Chart */}
          {reportData.length > 0 ? (
            <Card className="mb-8 md:mb-12 shadow-lg hover-card-lift">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                        Mood Trend
                    </CardTitle>
                    <CardDescription>Your mood ratings over the selected period (1=bad, 5=great).</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false}/>
                            <YAxis domain={[0, 5]} tickCount={6} fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                            <Bar dataKey="mood" name="Mood" fill="#82ca9d" radius={[3, 3, 0, 0]} barSize={20}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : null // Do not show the red warning if there are any entries in the selected range
          }

        </div>
      </main>
    </div>
  );
};

export default JournalReportPage;
