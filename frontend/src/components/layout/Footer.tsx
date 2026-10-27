
import React from 'react';
// Link import might not be used directly in this simplified footer, can be removed if so.
// Twitter icon from lucide-react is replaced by SVG

const Footer = () => {
  return (
    <footer className="bg-white border-t py-6 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-gray-500 sm:text-sm text-xs">&copy; {new Date().getFullYear()} MedASK AI. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center text-gray-500 sm:text-sm text-xs mt-2 text-center gap-1 sm:gap-0">
            <span>Created with love and care ❤️</span>
            <a 
              href="https://x.com/Siddh_eth" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-3 inline-flex items-center text-gray-500 hover:text-purple-600 transition-colors duration-200"
              aria-label="Siddh_eth on X/Twitter"
            >
              <svg 
                className="mr-1.5 h-4 w-4 fill-current"
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Siddh_eth
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
