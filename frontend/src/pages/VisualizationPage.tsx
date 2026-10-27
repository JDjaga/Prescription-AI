import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Filter, CalendarDays, Activity, TrendingUp, Smile, AlertTriangle, Info } from 'lucide-react';
import { DateRange, DayPicker } from 'react-day-picker';
import { format, subDays, isValid } from 'date-fns';
import 'react-day-picker/dist/style.css'; // Import DayPicker styles

// Real data structure for fetched journal entries
import { supabase } from '../supabaseClient';

interface JournalEntry {
  date: string; // YYYY-MM-DD
  symptoms: { [symptomName: string]: number }; // e.g., { Headache: 1, Fatigue: 1 }
  mood: number; // e.g., 1 (bad) to 5 (great)
}

const VisualizationPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [journalData, setJournalData] = useState<JournalEntry[]>([]);
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from supabase
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
          const MOOD_MAP: Record<string, number> = {
            'terrible': 1,
            'bad': 2,
            'okay': 3,
            'good': 4,
            'great': 5
          };
          const entries = json.entries.map((e: any) => {
            // Convert symptoms array to object for chart logic
            let symptomsObj: { [symptom: string]: number } = {};
            if (Array.isArray(e.symptoms)) {
              e.symptoms.forEach((sym: string) => {
                if (sym && typeof sym === 'string') symptomsObj[sym] = 1;
              });
            } else if (typeof e.symptoms === 'object' && e.symptoms !== null) {
              symptomsObj = e.symptoms;
            }
            // Map mood string to number if necessary
            let moodNum = typeof e.mood === 'number' ? e.mood : (MOOD_MAP[e.mood?.toLowerCase?.()] || 0);
            return {
              ...e,
              date: typeof e.date === 'string' ? e.date : new Date(e.date).toISOString().slice(0, 10),
              symptoms: symptomsObj,
              mood: moodNum,
            };
          });
          setJournalData(entries);
          // Collect all unique symptoms
          const symptomsSet = new Set<string>();
          entries.forEach(entry => {
            Object.keys(entry.symptoms).forEach(symptom => symptomsSet.add(symptom));
          });
          setAllSymptoms(Array.from(symptomsSet));
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedSymptom, setSelectedSymptom] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29), // Default to last 30 days
    to: new Date(),
  });

  // UseEffect to update selectedSymptom when allSymptoms changes
  useEffect(() => {
    if (allSymptoms.length > 0 && !allSymptoms.includes(selectedSymptom) && selectedSymptom !== 'All') {
      setSelectedSymptom('All');
    }
  }, [allSymptoms]);

  const filteredData = useMemo(() => {
    let dataToFilter = journalData;

    if (dateRange?.from && dateRange?.to) {
      dataToFilter = dataToFilter.filter(entry => {
        const entryDate = new Date(entry.date);
        return isValid(entryDate) && entryDate >= dateRange.from! && entryDate <= dateRange.to!;
      });
    } else if (dateRange?.from) { // Only from date selected
      dataToFilter = dataToFilter.filter(entry => {
        const entryDate = new Date(entry.date);
        return isValid(entryDate) && entryDate >= dateRange.from!;
      });
    }

    return dataToFilter.map(entry => ({
      fullDate: entry.date, // Keep original date for sorting
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      symptomValue: selectedSymptom === 'All'
        ? Object.values(entry.symptoms).reduce((sum: number, val: unknown) => sum + (typeof val === 'number' ? val : 0), 0) > 0 ? 1 : 0
        : (typeof entry.symptoms[selectedSymptom] === 'number' ? entry.symptoms[selectedSymptom] : 0),
      mood: typeof entry.mood === 'number' ? entry.mood : 0,
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [journalData, selectedSymptom, dateRange]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 shadow-lg rounded-md border border-gray-200">
          <p className="label text-sm font-medium text-gray-700">{`Date: ${label}`}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="text-sm">
              {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const NoDataDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <AlertTriangle className="w-12 h-12 mb-3 text-gray-400" />
      <p className="font-medium">No Data Available</p>
      <p className="text-sm">{message}</p>
    </div>
  );


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
      <main className="flex-grow py-8 md:py-12 animate-opacity-fade-in">
        <div className="container mx-auto px-4">
          {/* Removed animate-fade-in */}
          <div className="mb-10 md:mb-16 text-center">
            <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Health Visualizations
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Analyze your journal entries with dynamic charts and filters to understand trends.
            </p>
          </div>

          {/* Filters Section */}
          {/* Removed animate-fade-in and delay */}
          <Card className="mb-8 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center text-gray-700">
                <Filter className="w-5 h-5 mr-2 text-purple-600" />
                Filter Visualizations
              </CardTitle>
              <CardDescription>Select symptom and date range to refine your charts.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label htmlFor="symptom-filter" className="block text-sm font-medium text-gray-700 mb-2">Symptom</label>
                <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                  <SelectTrigger id="symptom-filter" className="w-full">
                    <SelectValue placeholder="Select a symptom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Symptoms (Occurrence)</SelectItem>
                    {allSymptoms.map(symptom => (
                      <SelectItem key={symptom} value={symptom}>{symptom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="date-range-filter" className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-range-filter"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                    >
                      <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      numberOfMonths={2}
                      defaultMonth={dateRange?.from || subDays(new Date(),30)}
                      footer={
                        <p className="text-xs text-center text-gray-500 p-2 border-t">
                            Select a start and end date for your analysis.
                        </p>
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Removed animate-fade-in and delay */}
            <Card className="shadow-md hover-card-lift">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    {selectedSymptom === 'All' ? 'Symptom Occurrence' : `${selectedSymptom} Frequency`} Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] md:h-[400px] pt-4">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} domain={[0, 1]} tickCount={2} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}/>
                      <Legend wrapperStyle={{fontSize: "12px"}}/>
                      <Line type="monotone" dataKey="symptomValue" name={selectedSymptom === 'All' ? 'Symptom Reported' : selectedSymptom} stroke="#8884d8" strokeWidth={2.5} activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }} dot={{ r: 3, fill: '#8884d8'}} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataDisplay message={`No ${selectedSymptom !== 'All' ? selectedSymptom : 'symptom'} data for selected range.`} />
                )}
              </CardContent>
            </Card>

            {/* Removed animate-fade-in and delay */}
            <Card className="shadow-md hover-card-lift">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <Smile className="w-5 h-5 mr-2 text-green-500" />
                    Mood Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] md:h-[400px] pt-4">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 5]} tickCount={6} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                      <Legend wrapperStyle={{fontSize: "12px"}}/>
                      <Bar dataKey="mood" name="Mood (1-bad, 5-great)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataDisplay message="No mood data for selected range."/>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Removed animate-fade-in and delay */}
          <Card className="mt-8 shadow-md">
             <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-500" />
                    Interpreting Your Charts
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
                <p>The 'Symptom Occurrence' chart shows days where any selected symptom (or a specific one) was reported (1 for present, 0 for absent).</p>
                <p>The 'Mood Over Time' chart displays your recorded mood on a scale of 1 (e.g., terrible) to 5 (e.g., great).</p>
                <p>Look for patterns, correlations between mood and symptoms, or changes after medication adjustments. This information can be a valuable starting point for discussions with your healthcare provider.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VisualizationPage;
