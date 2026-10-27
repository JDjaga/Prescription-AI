
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Camera, FileText, Upload, Check, AlertCircle, X } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Link } from 'react-router-dom'; // Import Link

import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface PrescriptionUploadProps {
  demoMode?: boolean;
}

const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({ demoMode = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
const [showHistory, setShowHistory] = useState(false);
const [history, setHistory] = useState<Array<{ name: string; id: string }>>(() => {
  const raw = sessionStorage.getItem('scanHistory');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
});

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (demoMode) {
      setUploadedFile(file);
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
        setAnalysisId('demo-analysis-id');
        toast({ title: 'Demo mode', description: 'Upload simulated.' });
      }, 1200);
      return;
    }
    setUploadedFile(file);
    setIsUploading(true);
    setUploadSuccess(false);
    setAnalysisId(null);

    const formData = new FormData();
    formData.append('image', file); // Backend expects 'image' field
    // You may want to add userId if available from auth
    // formData.append('userId', userId);
    try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/prescriptions/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setIsUploading(false);
      setUploadSuccess(true);
      // Robustly extract id from backend response
      let newId = data.id || data._id || data.analysisId || data.prescriptionId;
      if (!newId && typeof data === 'object') {
        // Try to guess: find the first string field that looks like an id
        for (const key in data) {
          if (typeof data[key] === 'string' && data[key].length > 8) {
            newId = data[key];
            break;
          }
        }
      }
      setAnalysisId(newId);
      setAnalysisResult(data); // Store the full analysis result
      if (!newId) {
        toast({
          title: "No Analysis ID Found!",
          description: "The backend did not return a valid analysis/report id. The 'View Analysis' button will remain disabled.",
          variant: "destructive",
        });
      }
      // Store in sessionStorage scan history
      const newEntry = { name: file.name, id: newId };
      const prev = sessionStorage.getItem('scanHistory');
      let arr: any[] = [];
      if (prev) { try { arr = JSON.parse(prev); } catch {} }
      arr.unshift(newEntry);
      if (arr.length > 10) arr = arr.slice(0, 10); // Limit to 10
      sessionStorage.setItem('scanHistory', JSON.stringify(arr));
      setHistory(arr);
      toast({
        title: "Prescription uploaded successfully!",
        description: "We're analyzing your prescription now.",
        variant: "default",
      });
    } catch (err) {
      setIsUploading(false);
      setUploadSuccess(false);
      toast({
        title: "Upload failed!",
        description: (err as Error).message || 'Something went wrong.',
        variant: "destructive",
      });
    }
  };

  const handleCamera = () => {
    // In a real app, this would open the camera
    toast({
      title: "Camera functionality",
      description: "This would open your device camera in a real application.",
      variant: "default",
    });
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-medask-light via-white to-medask-light/60 py-4 px-2 sm:px-0">
      {/* Overlay loading spinner */}
      {isUploading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm transition-all animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-medask-primary border-t-transparent animate-spin mb-6" style={{ borderRightColor: '#a78bfa' }}></div>
            <span className="text-lg font-semibold text-medask-primary">Uploading...</span>
            <span className="text-gray-500 mt-2">Please wait while we process your file.</span>
          </div>
        </div>
      )}
      <div className={`w-full max-w-3xl min-h-[500px] mx-auto bg-white/80 backdrop-blur border border-white/40 shadow-2xl rounded-3xl px-6 py-6 sm:px-12 sm:py-8 flex flex-col justify-center transition-all duration-300 ${isUploading ? 'opacity-40 pointer-events-none select-none' : ''}`}>
      <div className="flex justify-end mb-2">
        <button
  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white font-semibold shadow-md hover:brightness-110 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
  onClick={() => setShowHistory(h => !h)}
>
  <Clock className="w-4 h-4" />
  Scanned History
  {showHistory ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
</button>
      </div>
      {showHistory && (
        <div className="mb-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner p-4 max-h-60 overflow-y-auto animate-fade-in">
          {history.length === 0 ? (
            <div className="text-gray-400 text-center text-sm">No scans this session.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {history.map((item, i) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <span className="truncate text-gray-700 text-sm mr-2">{item.name}</span>
                  <Link
  to={`/analysis/${item.id}`}
  className="px-4 py-2 rounded-lg bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white text-sm font-semibold shadow-sm hover:brightness-110 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
  style={{ minWidth: 70, textAlign: 'center', display: 'inline-block' }}
>
  View
</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging ? 'border-medask-primary bg-medask-light bg-opacity-10' : 'border-gray-300'
        } ${uploadSuccess ? 'border-green-500 bg-green-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {uploadedFile ? (
          <div className="flex flex-col items-center animate-fade-in">
            {uploadSuccess && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            )}
            <h4 className="text-xl font-semibold mb-2">{uploadSuccess ? 'Upload Complete!' : isUploading ? 'Uploading...' : 'File Ready for Analysis'}</h4>
            <p className="text-gray-600 mb-3">{uploadedFile?.name}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button 
                variant="outline" 
                className="px-6"
                onClick={resetUpload}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Upload Another
              </Button>
              <Button
                className="bg-gradient-violet px-6"
                disabled={!analysisId || typeof analysisId !== 'string' || isUploading}
                title={!analysisId ? 'Waiting for analysis ID from backend...' : ''}
                onClick={() => {
                  if (analysisId && analysisResult && typeof analysisId === 'string' && !isUploading) {
                    navigate(`/analysis/${analysisId}`, { state: { analysisData: analysisResult } });
                  }
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Analysis
              </Button>
            </div>
            {isUploading && (
              <div className="flex flex-col items-center mt-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full p-3">
                  <div className="w-full h-full rounded-full border-4 border-medask-primary border-t-transparent animate-spin"></div>
                </div>
                <h4 className="text-xl font-semibold mt-4">Uploading...</h4>
                <p className="text-gray-600 mt-2">Please wait while we process your file.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h4 className="text-xl font-semibold mb-2">Drag and drop your prescription here</h4>
            <p className="text-gray-500 mb-6">Or click to browse your files</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
  className="w-full flex items-center justify-center gap-2 py-3.5 px-7 rounded-lg text-lg font-bold shadow hover:brightness-105 transition-all duration-200 bg-gradient-to-r from-[#a259f7] to-[#6a7cff] text-white"
  onClick={() => document.getElementById('prescription-upload-input')?.click()}
  disabled={isUploading}
>
  <Upload className="w-6 h-6 mr-2 text-white" />
  Choose File
</Button>
              <input
                type="file"
                accept="image/*,application/pdf"
                id="prescription-upload-input"
                className="hidden"
                onChange={handleFileInput}
                disabled={demoMode}
              />
              
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Accepted formats: JPG, PNG, PDF (max 10MB)
            </p>
          </>
        )}
      </div>
      
      <div className="mt-2 bg-medask-light bg-opacity-20 rounded-lg p-5">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <AlertCircle className="w-5 h-5 text-medask-secondary" />
          </div>
          <div>
            <h5 className="font-semibold mb-2">Privacy Notice</h5>
            <p className="text-sm text-gray-600">
              Your prescription data is encrypted and securely stored. We use this information only to provide you with medication explanations and natural remedy suggestions. Read our <a href="#" className="text-medask-primary underline">Privacy Policy</a> for more details.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PrescriptionUpload;
