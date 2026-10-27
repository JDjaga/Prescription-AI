
import React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Journal from "./pages/Journal";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from './pages/Register';
import GetStarted from './pages/GetStarted';
import RequireAuth from "./components/auth/RequireAuth";
import NotFound from "./pages/NotFound";

import Subscription from "./pages/Subscription";
import AnalysisResultPage from "./pages/AnalysisResultPage";
import NaturalRemediesPage from "./pages/NaturalRemediesPage";
import VisualizationPage from "./pages/VisualizationPage";
import JournalReportPage from "./pages/JournalReportPage";
import AboutPage from "./pages/AboutPage"; // Import AboutPage

const queryClient = new QueryClient();

const FooterConditional = () => {
  const location = useLocation();
  const showFooter = ["/", "/about", "/login", "/getstarted"].includes(location.pathname);
  return showFooter ? <Footer /> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Removed top padding so content can go to the very top, behind a transparent-at-top navbar */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
              <Route path="/journal" element={<RequireAuth><Journal /></RequireAuth>} />
              <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/getstarted" element={<GetStarted />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/analysis-result" element={<AnalysisResultPage />} />
              <Route path="/natural-remedies" element={<NaturalRemediesPage />} />
              <Route path="/journal/visualize" element={<VisualizationPage />} />
              <Route path="/journal/report" element={<JournalReportPage />} />
              <Route path="/about" element={<AboutPage />} /> 
              <Route path="/analysis/:prescriptionId" element={<AnalysisResultPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <FooterConditional />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
