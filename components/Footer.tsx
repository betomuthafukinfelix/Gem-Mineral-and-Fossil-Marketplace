
import React from 'react';
import { GeologyIcon } from './icons/GeologyIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <GeologyIcon className="h-8 w-8 text-cyan-400" />
            <span className="ml-3 text-xl font-bold text-white">GeoMarket AI</span>
          </div>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">About</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
          </div>
          <p className="text-gray-500 mt-4 md:mt-0 text-sm">
            &copy; {new Date().getFullYear()} GeoMarket AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
