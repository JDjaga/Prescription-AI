
import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import { Pill, Clock, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, ExternalLink, FileText, Download, Check, Leaf } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

// --- Types ---
interface AnalysisDetails {
  fileName: string;
  uploadDate: string;
  summary: string;
  medicines: Array<{
    name: string;
    type: string;
    description: string;
    dosage: string;
    frequency: string;
    sideEffects: string[];
    warnings: string[];
    interactions: string[];
  }>;
  overallRiskLevel?: 'Low' | 'Moderate' | 'High';
  recommendations: string[];
}

// --- Main Component ---
const AnalysisResultPage: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId?: string }>(); // Use correct param name
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState<AnalysisDetails | null>(null);
  // Helper to normalize backend data
  function normalizeAnalysis(raw: any): AnalysisDetails {
    return {
      fileName: raw.fileName,
      uploadDate: raw.uploadDate,
      summary: raw.summary,
      medicines: (raw.medicines || raw.medications || []).map((med: any) => ({
      name: med.name,
      type: med.type,
      description: med.description,
      dosage: med.dosage,
      frequency: med.frequency,
      sideEffects: med.sideEffects || med.side_effects || [],
      warnings: med.warnings || [],
      interactions: med.interactions || [],
    })),

      overallRiskLevel: raw.overallRiskLevel || raw.risk_level || undefined,
      recommendations: Array.isArray(raw.recommendations)
        ? raw.recommendations
        : typeof raw.recommendations === 'string' && raw.recommendations
        ? raw.recommendations.split(/(?<=\.)\s+/).filter(Boolean)
        : [],
    };
  }
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch analysis data from backend
  useEffect(() => {
    const locationState = location.state as { analysisData?: any };
    console.log('[AnalysisResultPage] Received location state:', locationState);

    if (locationState?.analysisData) {
      // The actual analysis data is nested inside an 'analysis' property
      const rawAnalysis = locationState.analysisData.analysis || locationState.analysisData;
      setAnalysisData(normalizeAnalysis(rawAnalysis));
      setLoading(false);
      setError(null);
    } else if (prescriptionId) {
      // Otherwise, fetch from the API as a fallback (e.g., for bookmarked URLs)
      setLoading(true);
      setError(null);
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analysis/${prescriptionId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to fetch analysis (status ${res.status})`);
          const data = await res.json();
          setAnalysisData(normalizeAnalysis(data));
          setLoading(false);
        })
        .catch((err: any) => {
          setError(`Failed to fetch analysis: ${err.message}`);
          setLoading(false);
        });
    } else {
      // No ID and no state, so there's nothing to load
      setError('No prescription ID was provided and no analysis data was found.');
      setLoading(false);
    }
  }, [prescriptionId, location.state]);

  // Expand/collapse medicine sections
  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  // Download PDF logic
  const handleDownloadPdf = () => {
    if (!analysisData) return; // Added null check
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;

    // --- Reusable styling and spacing constants ---
    const FONT_TITLE = 20;
    const FONT_SECTION_HEADER = 15;
    const FONT_SUB_HEADER = 13;
    const FONT_BODY = 10;
    const FONT_SMALL = 9;
    const FONT_VERY_SMALL = 8;

    const LINE_HEIGHT_MULTIPLIER = 1.3;
    const getLineHeight = (size: number) => size * LINE_HEIGHT_MULTIPLIER;

    const SPACE_AFTER_TITLE = getLineHeight(FONT_TITLE) * 0.5;
    const SPACE_AFTER_SECTION_HEADER = getLineHeight(FONT_SECTION_HEADER) * 0.6;
    const SPACE_AFTER_SUB_HEADER = getLineHeight(FONT_SUB_HEADER) * 0.5;
    const SPACE_BETWEEN_ITEMS = getLineHeight(FONT_BODY) * 0.3;
    const SPACE_SECTION_BREAK = getLineHeight(FONT_BODY) * 1.5;
    const LINE_OFFSET = 4; // Points below baseline for lines
    const SUB_LINE_OFFSET = 3;

    interface PdfTextOptions {
      align?: 'left' | 'center' | 'right' | 'justify';
      textColor?: string;
    }

    // --- Helper Functions ---
    const checkPageBreak = (yPosition: number, requiredSpace: number = 0) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        return margin; // New Y position
      }
      return yPosition;
    };

    const addPdfText = (text: string | string[], x: number, y: number, fontSize: number, fontStyle: string = 'normal', options: PdfTextOptions = {}) => {
      currentY = checkPageBreak(y, getLineHeight(fontSize) * (Array.isArray(text) ? text.length : 1));
      pdf.setFont('helvetica', fontStyle);
      pdf.setFontSize(fontSize);
      
      const originalColor = pdf.getTextColor();
      if (options.textColor) {
        pdf.setTextColor(options.textColor);
      }
      
      pdf.text(text, x, currentY, options);
      
      if (options.textColor) {
        pdf.setTextColor(originalColor); // Reset to original color
      }
      
      currentY += getLineHeight(fontSize) * (Array.isArray(text) ? text.length : 1);
      return currentY;
    };

    const addWrappedPdfText = (text: string, x: number, y: number, fontSize: number, fontStyle: string = 'normal', maxWprescriptionIdth: number, options: PdfTextOptions = {}) => {
      pdf.setFont('helvetica', fontStyle);
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWprescriptionIdth);
      const textBlockHeight = lines.length * getLineHeight(fontSize);
      currentY = checkPageBreak(y, textBlockHeight);
      pdf.text(lines, x, currentY, options);
      currentY += textBlockHeight;
      return currentY;
    };
    
    const drawLine = (x1: number, y1: number, x2: number, y2: number, weight: number = 0.5) => {
      currentY = checkPageBreak(y1, weight + 2); // Ensure line itself doesn't cause immediate break after text
      pdf.setLineWidth(weight);
      pdf.line(x1, currentY, x2, currentY);
      currentY += weight + 2; // Space for the line itself
      return currentY;
    };

    // --- PDF Content Generation ---

    // Report Title Section
    currentY = addPdfText(
      'Your Prescription',
      pageWidth / 2,
      currentY,
      FONT_SECTION_HEADER, // Using a slightly smaller size for this subtitle
      'bold',
      { align: 'center', textColor: '#6B21A8' } // Theme purple color (Tailwind purple-700)
    );
    currentY += SPACE_AFTER_SUB_HEADER * 0.7; // Adjusted space

    currentY = addPdfText(
      'Analysis Report', // Main title
      pageWidth / 2,
      currentY,
      FONT_TITLE,
      'bold',
      { align: 'center' }
    );
    currentY += SPACE_AFTER_TITLE;

    // File Info
    currentY = addPdfText(
      `File: ${analysisData.fileName} | Uploaded: ${analysisData.uploadDate}`,
      pageWidth / 2, currentY, FONT_SMALL, 'italic', { align: 'center' }
    );
    currentY += SPACE_SECTION_BREAK;

    // Analysis Summary
    currentY = addPdfText('Analysis Summary', margin, currentY, FONT_SECTION_HEADER, 'bold');
    currentY = drawLine(margin, currentY - getLineHeight(FONT_SECTION_HEADER) + LINE_OFFSET, pageWidth - margin, currentY - getLineHeight(FONT_SECTION_HEADER) + LINE_OFFSET, 1);
    currentY += SPACE_AFTER_SECTION_HEADER / 2;
    currentY = addWrappedPdfText(analysisData.summary, margin, currentY, FONT_BODY, 'normal', contentWidth);
    currentY += SPACE_SECTION_BREAK;

    // Overall Risk Level
    if (analysisData.overallRiskLevel) {
      currentY = checkPageBreak(currentY, getLineHeight(FONT_SUB_HEADER) * 2);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(FONT_SUB_HEADER);
      const riskLabel = 'Overall Potential Risk Level:';
      pdf.text(riskLabel, margin, currentY);
      
      pdf.setFont('helvetica', 'bold'); // Risk level itself also bold
      let riskColor = '#333333'; // Dark Gray
      if (analysisData.overallRiskLevel === 'Low') riskColor = '#28a745';
      else if (analysisData.overallRiskLevel === 'Moderate') riskColor = '#fd7e14';
      else if (analysisData.overallRiskLevel === 'High') riskColor = '#dc3545';
      pdf.setTextColor(riskColor);
      pdf.text(analysisData.overallRiskLevel, margin + pdf.getTextWidth(riskLabel) + 8, currentY);
      pdf.setTextColor('#000000'); // Reset color
      currentY += getLineHeight(FONT_SUB_HEADER);
      currentY += SPACE_SECTION_BREAK;
    }

    // Medication Details Section Title
    currentY = addPdfText('Medication Details', margin, currentY, FONT_SECTION_HEADER, 'bold');
    currentY = drawLine(margin, currentY - getLineHeight(FONT_SECTION_HEADER) + LINE_OFFSET, pageWidth - margin, currentY - getLineHeight(FONT_SECTION_HEADER) + LINE_OFFSET, 1);
    currentY += SPACE_AFTER_SECTION_HEADER / 2;

    analysisData.medicines.forEach((med, index) => {
      currentY = checkPageBreak(currentY, getLineHeight(FONT_SUB_HEADER) * 5); // Estimate initial space for a med entry

      // Medicine Name and Type
      currentY = addPdfText(`${med.name} (${med.type})`, margin, currentY, FONT_SUB_HEADER, 'bold');
      currentY = drawLine(margin, currentY - getLineHeight(FONT_SUB_HEADER) + SUB_LINE_OFFSET, contentWidth * 0.75 + margin, currentY - getLineHeight(FONT_SUB_HEADER) + SUB_LINE_OFFSET, 0.5); // Shorter line
      currentY += SPACE_AFTER_SUB_HEADER / 2;
      
      // Description
      currentY = addWrappedPdfText(med.description, margin, currentY, FONT_BODY, 'normal', contentWidth);
      currentY += SPACE_BETWEEN_ITEMS;

      // Dosage and Frequency (SprescriptionIde-by-sprescriptionIde if possible, or stacked)
      const dosageLabel = "Dosage:";
      const frequencyLabel = "Frequency:";
      pdf.setFontSize(FONT_BODY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dosageLabel, margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(med.dosage, margin + pdf.getTextWidth(dosageLabel) + 5, currentY);
      
      const freqX = margin + contentWidth / 2 + 20; // Start frequency a bit past halfway
      if (freqX + pdf.getTextWidth(frequencyLabel + med.frequency) < pageWidth - margin) { // Check if it fits on one line
        pdf.setFont('helvetica', 'bold');
        pdf.text(frequencyLabel, freqX, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(med.frequency, freqX + pdf.getTextWidth(frequencyLabel) + 5, currentY);
        currentY += getLineHeight(FONT_BODY);
      } else { // Stack them
        currentY += getLineHeight(FONT_BODY);
        pdf.setFont('helvetica', 'bold');
        pdf.text(frequencyLabel, margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(med.frequency, margin + pdf.getTextWidth(frequencyLabel) + 5, currentY);
        currentY += getLineHeight(FONT_BODY);
      }
      currentY += SPACE_BETWEEN_ITEMS * 2;

      // Lists: SprescriptionIde Effects, Warnings, Interactions in columns
      const listTitles = ["Side Effects", "Warnings", "Interactions"];
      const listData = [med.sideEffects, med.warnings, med.interactions];
      const listColWidth = (contentWidth - 20) / 3; // 20 for padding between columns
      let maxListY = currentY;

      currentY = checkPageBreak(currentY, getLineHeight(FONT_SMALL) * 3); // Min space for list titles
      let initialListY = currentY;

      for (let i = 0; i < listTitles.length; i++) {
        const colX = margin + i * (listColWidth + 10); // +10 for inter-column padding
        let tempY = initialListY;

        tempY = addPdfText(listTitles[i], colX, tempY, FONT_SMALL, 'bold');
        tempY += SPACE_BETWEEN_ITEMS / 2;
        
        listData[i].forEach(item => {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(FONT_VERY_SMALL);
          const itemLines = pdf.splitTextToSize(`• ${item}`, listColWidth - 5); // -5 for bullet padding
          const itemBlockHeight = itemLines.length * getLineHeight(FONT_VERY_SMALL);
          
          if (tempY + itemBlockHeight > pageHeight - margin - getLineHeight(FONT_VERY_SMALL)) { // Check break before drawing item
            if (i === 0) { // Only first column triggers full page break for the list section
              pdf.addPage();
              initialListY = margin; tempY = margin;
              currentY = margin; // Reset main Y as well
              tempY = addPdfText(listTitles[i], colX, tempY, FONT_SMALL, 'bold'); // Re-add title on new page
              tempY += SPACE_BETWEEN_ITEMS / 2;
            } else {
              // If not first column, try to just stop adding items to this column to prevent overflow
              return; // Stop adding to this column if it would overflow significantly
            }
          }
          pdf.text(itemLines, colX, tempY);
          tempY += itemBlockHeight + SPACE_BETWEEN_ITEMS / 2;
        });
        maxListY = Math.max(maxListY, tempY);
      }
      currentY = maxListY + SPACE_BETWEEN_ITEMS;

      if (index < analysisData.medicines.length - 1) {
        currentY += SPACE_SECTION_BREAK; // Space before next medicine
      }
    });

    // Key Recommendations
    currentY = checkPageBreak(currentY, getLineHeight(FONT_SECTION_HEADER) * 2);
    currentY = addPdfText('Key Recommendations', margin, currentY, FONT_SECTION_HEADER, 'bold');
    currentY = drawLine(margin, currentY - getLineHeight(FONT_SECTION_HEADER) + LINE_OFFSET, pageWidth - margin, currentY - getLineHeight(FONT_SECTION_HEADER) + LINE_OFFSET, 1);
    currentY += SPACE_AFTER_SECTION_HEADER / 2;

    analysisData.recommendations.forEach(rec => {
      currentY = addWrappedPdfText(`• ${rec}`, margin, currentY, FONT_BODY, 'normal', contentWidth - margin); // -margin for bullet
      currentY += SPACE_BETWEEN_ITEMS;
    });
    currentY += SPACE_SECTION_BREAK;

    // Page Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      addPdfText(
        `Page ${i} of ${pageCount} - MedASK AI Report`,
        pageWidth / 2,
        pageHeight - margin / 1.5, // Position higher for better margin from bottom
        FONT_VERY_SMALL, 'italic', { align: 'center' }
      );
    }

    pdf.save(`MedASK_Analysis_${analysisData.fileName.split('.')[0]}.pdf`);
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-purple-400 border-t-transparent animate-spin mb-6"></div>
            <p className="text-lg font-semibold text-purple-700">Loading analysis...</p>
          </div>
        </main>
      </div>
    );
  }

  // Inline warning for error or missing analysis ID (never a blocking card)
  const showInlineWarning = error || !prescriptionId;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main id="analysisReportContent" className="flex-grow py-8 md:py-12 animate-opacity-fade-in">
        <div className="container mx-auto px-4">
          {/* Inline warning at the top if needed */}
          {showInlineWarning && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md px-4 py-2 mb-6 text-center text-base">
              {error ? error : 'No analysis ID provided. Please upload a prescription.'}
            </div>
          )}

          {/* Header Section */}
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-600 mb-1">
              Your Prescription
            </h2>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Analysis Report
            </h1>
            <p className="text-lg text-gray-600">
              Uploaded: <span className="font-medium text-gray-700">{analysisData ? analysisData.fileName : '-'}</span> on {analysisData ? analysisData.uploadDate : '-'}
            </p>
          </div>

          {/* Summary and Overall Risk */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-purple-600 mr-3" />
            </div>
            <p className="text-gray-700 mb-4 text-base md:text-lg">{analysisData ? analysisData.summary : '-'}</p>
            {analysisData && analysisData.overallRiskLevel ? (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                analysisData.overallRiskLevel === 'Low' ? 'bg-green-50 text-green-700' :
                analysisData.overallRiskLevel === 'Moderate' ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                <AlertTriangle className="w-6 h-6" />
                <p className="font-medium">Overall Potential Risk Level: {analysisData.overallRiskLevel}</p>
              </div>
            ) : null}
          </div>

          {/* Medicines Section */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center md:text-left">
              Medication Details
            </h2>
            <div className="space-y-6">
              {analysisData && analysisData.medicines && analysisData.medicines.length > 0 ? (
                analysisData.medicines.map((med, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                            <Pill className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{med.name}</h3>
                            <p className="text-sm text-gray-600">{med.type}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => toggleSection(med.name)}
                          className="text-purple-600 border-purple-500 hover:bg-purple-100 hover:text-purple-700 py-2 px-3 text-sm flex items-center gap-1.5"
                        >
                          {expandedSections[med.name] ? (
                            <>
                              <span>See Less</span>
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <span>See More</span>
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-gray-700 mb-4 text-sm md:text-base">{med.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-purple-600 mb-1">
                            <Pill className="w-4 h-4 mr-2" />
                            <span className="text-xs font-medium uppercase tracking-wider">Dosage</span>
                          </div>
                          <p className="text-gray-800 font-medium text-sm md:text-base">{med.dosage}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-purple-600 mb-1">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-xs font-medium uppercase tracking-wider">Frequency</span>
                          </div>
                          <p className="text-gray-800 font-medium text-sm md:text-base">{med.frequency}</p>
                        </div>
                      </div>
                      {expandedSections[med.name] && (
                        <div className="mt-6 space-y-6 animate-fade-in">
                          <div>
                            <h4 className="text-md font-semibold mb-2 text-gray-800">Possible Side Effects</h4>
                            <ul className="space-y-1.5 list-disc list-inside pl-1">
                              {(med.sideEffects || []).map((effect, i) => (
                                <li key={i} className="text-sm text-gray-700">{effect}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-md font-semibold mb-2 text-gray-800 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                              Warnings & Precautions
                            </h4>
                            <ul className="space-y-1.5 list-disc list-inside pl-1">
                              {(med.warnings || []).map((warning, i) => (
                                <li key={i} className="text-sm text-gray-700">{warning}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-md font-semibold mb-2 text-gray-800 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                              Potential Interactions
                            </h4>
                            <ul className="space-y-1.5 list-disc list-inside pl-1">
                              {(med.interactions || []).map((interaction, i) => (
                                <li key={i} className="text-sm text-gray-700">{interaction}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">No medicine details available.</div>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex items-center mb-4">
              <Check className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Key Recommendations</h2>
            </div>
            <ul className="space-y-2.5 list-disc list-inside pl-1">
              {analysisData && analysisData.recommendations && analysisData.recommendations.length > 0 ? (
                analysisData.recommendations.map((rec, i) => (
                  <li key={i} className="text-gray-700 text-base md:text-lg">{rec}</li>
                ))
              ) : (
                <li className="text-gray-500">No recommendations available.</li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-3 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4 mt-10">
            <Button 
              size="lg" 
              onClick={handleDownloadPdf}
              className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white hover:opacity-95 transition-opacity duration-200 shadow-sm hover:shadow-md px-8 py-3 text-base md:text-lg flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Report (PDF)
            </Button>
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 text-white hover:opacity-95 transition-opacity duration-200 shadow-sm hover:shadow-md px-8 py-3 text-base md:text-lg flex items-center justify-center"
              disabled={!analysisData || !analysisData.summary}
              onClick={() => {
                if (analysisData && analysisData.summary) {
                  // Extract the main ailment from the summary (simple heuristic: first disease/ailment word)
                  let ailment = '';
                  const match = analysisData.summary.match(/diagnosed with ([^.]+)/i);
                  if (match && match[1]) {
                    ailment = match[1].split(/[,.]/)[0].trim();
                  } else {
                    ailment = analysisData.summary.split(/[,.]/)[0].trim();
                  }
                  window.location.href = `/natural-remedies?ailment=${encodeURIComponent(ailment)}`;
                }
              }}
            >
              <Leaf className="w-5 h-5 mr-2" />
              Natural remedy
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalysisResultPage;