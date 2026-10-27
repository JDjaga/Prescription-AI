import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { Leaf, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RemedyProps {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string[];
  usageInstructions: string;
  potentialRisks?: string[];
  scientificEvidence?: string;
  effectivenessScore: number;
  userRating?: number;
  imageUrl?: string;
  relatedConditions?: string[];
  sources?: Array<{ title: string; url: string }>;
}

const NaturalRemediesPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [remedies, setRemedies] = useState<RemedyProps[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRemedies([]);
    setSummary('');
    try {
      const conditions = searchInput.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
      if (conditions.length === 0) {
        setError('Please enter at least one ailment or condition.');
        setLoading(false);
        return;
      }
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/remedies/search-and-summarize`, { conditions });
      if (res.data.success) {
        setRemedies(res.data.remedies || []);
        setSummary(res.data.summary || '');
      } else {
        setError(res.data.message || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch remedies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('NaturalRemediesPage mounted and scrolled to top.');
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10 md:mb-16 text-center animate-fade-in">
            <div className="inline-block p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-4 shadow-lg">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Explore Natural Remedies
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover natural alternatives and lifestyle adjustments that may complement your health plan. Always consult your doctor before making changes.
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-center animate-fade-in">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Enter ailments (e.g. Eye Strain, Dry Eyes)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base"
            />
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md">
              Search
            </Button>
          </form>

          {loading && (
            <div className="text-center text-emerald-600 font-medium animate-pulse mb-6">Searching for remedies...</div>
          )}
          {error && (
            <div className="text-center text-red-600 font-medium mb-6">{error}</div>
          )}

          {remedies.length > 0 && !loading && !error && (
            <div className="max-w-4xl mx-auto animate-fade-in">
               {summary && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-purple-800 text-base shadow-sm">
                  <span className="font-semibold">AI Recommendation: </span>{summary}
                </div>
              )}
              <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  {
                    remedies.map((remedy, index) => (
                      <div key={remedy.id}>
                        {index > 0 && <hr className="my-6 border-gray-200" />}

                        <div className="flex items-center mb-4">
                           {remedy.imageUrl && (
                              <img
                                src={remedy.imageUrl}
                                alt={remedy.name}
                                className="w-16 h-16 object-cover rounded-lg mr-4 shadow-md"
                              />
                           )}
                          <div className="flex-1">
                            <CardTitle className="text-2xl font-bold text-gray-800">{remedy.name}</CardTitle>
                            {remedy.category && <p className="text-md text-gray-600 mt-0.5 italic">{remedy.category}</p>}
                          </div>
                        </div>

                        {remedy.description && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Description:</h4>
                            <p className="text-base text-gray-700 leading-relaxed">{remedy.description}</p>
                          </div>
                        )}

                        {remedy.benefits && remedy.benefits.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Key Benefits:</h4>
                            <ul className="space-y-2 list-disc list-inside pl-4 text-base text-gray-700 leading-relaxed">
                              {remedy.benefits.map((benefit, i) => (
                                <li key={i}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {remedy.usageInstructions && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">How to Use:</h4>
                            <p className="text-base text-gray-700 leading-relaxed">{remedy.usageInstructions}</p>
                          </div>
                        )}

                        {remedy.potentialRisks && remedy.potentialRisks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 bg-red-50 border-red-200 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-red-700 mb-2">Potential Risks:</h4>
                            <ul className="space-y-2 list-disc list-inside pl-4 text-base text-red-600 leading-relaxed">
                              {remedy.potentialRisks.map((risk, i) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {remedy.scientificEvidence && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Scientific Note:</h4>
                            <p className="text-base text-gray-700 italic leading-relaxed">{remedy.scientificEvidence}</p>
                          </div>
                        )}

                        {remedy.sources && remedy.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Sources:</h4>
                            <ul className="space-y-1.5 leading-relaxed">
                              {remedy.sources.map((source, i) => (
                                <li key={i}>
                                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:text-purple-800 hover:underline">
                                    {source.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </CardContent>
              </Card>
            </div>
          )}

          {remedies.length === 0 && !loading && !error && (
              <div className="col-span-full text-center text-gray-500 py-8 animate-fade-in">
                No remedies found. Try searching for a different ailment.
              </div>
            )}

          <div className="mt-12 text-center animate-fade-in delay-300">
            <Button size="lg" className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/30 text-white px-8 py-3 text-base md:text-lg" asChild>
              <Link to="/chat">
                <MessageCircle className="w-5 h-5 mr-2" />
                Discuss Remedies with AI
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NaturalRemediesPage;
