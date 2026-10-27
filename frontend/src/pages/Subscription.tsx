import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';

import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Check } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  cta, 
  popular = false,
  className = "" 
}: { 
  title: string; 
  price: string; 
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  className?: string;
}) => {
  return (
    <Card className={`hover-card-lift transition-all duration-300 h-full flex flex-col ${popular ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/20' : 'border border-gray-200'} ${className}`}>
      <CardHeader className={`${popular ? 'bg-gradient-to-br from-purple-500/10 via-indigo-600/10 to-purple-700/10' : ''}`}>
        {popular && (
          <div className="w-full flex justify-center -mt-8 mb-2">
            <span className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white text-xs font-bold uppercase tracking-wide py-1 px-3 rounded-full">
              Most Popular
            </span>
          </div>
        )}
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-gray-500 ml-2">/month</span>}
        </div>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="h-5 w-5 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          className={`w-full py-6 ${popular ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/30' : 'bg-white border border-purple-400 text-purple-600 hover:bg-purple-50'}`}
          asChild
        >
          <Link to="/register">{cta}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const Subscription = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      title: "Basic",
      price: "Free",
      description: "Perfect for beginners exploring MedASK AI",
      features: [
        "5 prescription upload per month",
        "10-day journal access",
        "Limited AI Chat",
        "Basic medicine explanations",
        "Limited natural remedy suggestions"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      title: "Standard",
      price: "$15",
      description: "Unlocks all MedASK AI features.",
      features: [
        "Unlimited prescription uploads",
        "Unlimited journal access",
        "Unlimited AI Chat",
        "Priority support",
        "Unlimited natural remedy suggestions"
      ],
      cta: "Subscribe Now",
      popular: true
    }
  ];
  
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Subscriptions Coming Soon Tag */}
      <div className="flex justify-center mt-6">
        <span className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-700 text-white text-base font-semibold shadow-lg animate-pulse-custom border-2 border-white/60">
          <svg className="w-5 h-5 mr-2 text-yellow-300 animate-bounce" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 01.894.553l7 14A1 1 0 0117 18H3a1 1 0 01-.894-1.447l7-14A1 1 0 0110 2zm0 3.618L4.618 16h10.764L10 5.618zM9 8h2v4H9V8zm0 6h2v2H9v-2z"/></svg>
          Subscriptions coming soon!
        </span>
      </div>
      
      <main className="flex-grow animate-opacity-fade-in">
        <section className="section-padding pt-28">
          <div className="container mx-auto px-4">
            {/* Removed animate-fade-in */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Choose the Right <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-600">Plan</span> For You
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get insights into your medications and natural alternatives with our subscription plans.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 pb-20">
              {/* Basic Plan */}
              <div className="flex flex-col justify-center items-center">
                <PricingCard
                  title={plans[0].title}
                  price={plans[0].price}
                  description={plans[0].description}
                  features={plans[0].features}
                  cta={plans[0].cta}
                  popular={plans[0].popular}
                />
              </div>
              {/* Standard Plan */}
              <div className="flex flex-col justify-center items-center md:pl-12">
                <PricingCard
                  title={plans[1].title}
                  price={plans[1].price}
                  description={plans[1].description}
                  features={plans[1].features}
                  cta={plans[1].cta}
                  popular={plans[1].popular}
                />
              </div>
            </div>
            
            {/* Removed animate-fade-in */}
            <div className="text-center mt-16">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto text-left space-y-6">
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-lg mb-2">Can I switch between plans?</h3>
                  <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.</p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
                  <p className="text-gray-600">Our Basic plan is free forever with limited features. You can upgrade to a paid plan at any time.</p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-lg mb-2">How do the usage limits work?</h3>
                  <p className="text-gray-600">Usage limits reset at the beginning of each month for monthly subscribers. Features are disabled once you reach your plan limits.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
};

export default Subscription;
