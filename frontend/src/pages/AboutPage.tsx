
import React, { useEffect, useState } from 'react'; // Added useState
import Navbar from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel, // If you want a cancel button, otherwise remove
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Mail, ShieldCheck, Lightbulb, HeartHandshake, Cpu, Info } from 'lucide-react'; // Added Info for dialog icon

const AboutPage = () => {
  const [isSupportAlertOpen, setIsSupportAlertOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on page load
  }, []);

  // const handleSupportClick = () => { // Replaced by AlertDialogTrigger
  //   window.location.href = "mailto:support@medask.ai?subject=Support Inquiry - MedASK AI";
  // };

  const features = [
    {
      icon: <Cpu className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Insights",
      description: "Leveraging advanced AI to simplify complex medical terminologies and provide clear explanations."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
      title: "Privacy Focused",
      description: "Your health data is sensitive. We are committed to ensuring its privacy and security at every step."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
      title: "Empowering Users",
      description: "Our goal is to empower you with knowledge, helping you make informed decisions about your health."
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-red-500" />,
      title: "Holistic Approach",
      description: "We believe in a holistic view of health, offering insights into natural remedies alongside conventional treatments."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 animate-opacity-fade-in">
        <div className="w-full max-w-5xl space-y-10 md:space-y-12">

          {/* Header Section */}
          <section className="text-center">
            <div className="inline-block bg-gradient-to-br from-purple-500 to-indigo-600 p-3 md:p-4 rounded-full mb-4 md:mb-6 shadow-lg">
              <HeartHandshake className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              About <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-600">MedASK AI</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Simplifying your health journey with intelligent insights and compassionate technology.
            </p>
          </section>

          {/* Our Mission Section */}
          <section>
            <Card className="bg-white shadow-xl border-gray-200/80 hover-card-lift transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-gray-800 text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-700 md:text-lg leading-relaxed">
                  At MedASK AI, our mission is to demystify medical information and empower individuals to take an active role in their health management. We aim to bridge the gap between complex medical jargon and patient understanding by providing clear, AI-driven insights about prescriptions, potential interactions, and complementary natural remedies. We believe that informed patients are healthier patients.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Features/Values Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8">What We Stand For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white shadow-lg border-gray-100 hover-card-lift transition-all duration-300 flex flex-col text-center items-center">
                  <CardHeader className="items-center">
                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-700">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Support Section */}
          <section className="text-center py-8 md:py-10 bg-white rounded-xl shadow-xl border-gray-200/80">
             <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Need Help?</h2>
            <p className="text-gray-600 md:text-lg mb-6 max-w-xl mx-auto">
              Have questions, feedback, or need assistance? Our team is here to help you get the most out of MedASK AI.
            </p>
            <AlertDialog open={isSupportAlertOpen} onOpenChange={setIsSupportAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white hover:opacity-95 transition-opacity duration-200 shadow-md hover:shadow-lg px-10 py-6 text-lg"
                >
                  <Mail className="w-5 h-5 mr-2.5" />
                  Contact Support Soon
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white rounded-lg shadow-xl sm:max-w-md">
                <AlertDialogHeader>
                  <div className="flex justify-center mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full">
                      <Info className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <AlertDialogTitle className="text-center text-xl font-semibold text-gray-800">Important Notice</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription className="text-center text-gray-600 px-2 space-y-3">
                  <p>
                    We are currently in our beta version. Once MedASK AI is fully launched, we will enable direct support channels.
                  </p>
                  <p>
                    Thanks for your valuable cooperation!
                  </p>
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-700 text-lg pt-2">
                    Health is wealth
                  </p>
                </AlertDialogDescription>
                <AlertDialogFooter className="sm:justify-center mt-4">
                  <AlertDialogAction 
                    onClick={() => setIsSupportAlertOpen(false)}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                  >
                    Understood
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>

        </div>
      </main>
    </div>
  );
};

export default AboutPage;
