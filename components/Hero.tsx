

import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeroProps {
  onAnalyze: (file: File, prompt: string) => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
        setFileError(null);
    }
  };
  
  const handleAnalyzeClick = () => {
    if (!file) {
      setFileError('Please select an image file to analyze.');
      return;
    }
    setFileError(null);
    onAnalyze(file, prompt);
  };

  return (
    <section id="analyze" className="relative py-20 sm:py-28 overflow-hidden">
        <div className="theme-jumanji-hero-bg"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
          Identify, Appraise, & Certify with AI
        </h1>
        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-400 mb-10">
          Upload an image of your gem, mineral, or fossil to get an instant AI-powered analysis, valuation, and certification report.
        </p>
        <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
          <ImageUploader onFileChange={handleFileChange} onError={setFileError} />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional: Add details or questions (e.g., 'Is this real turquoise?')"
            className="w-full mt-4 p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
            rows={2}
          ></textarea>
          {fileError && <p className="text-red-400 mt-3 text-sm">{fileError}</p>}
          <button
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="mt-6 w-full inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
                <>
                    <SparklesIcon className="mr-3 h-6 w-6" />
                    Analyze Specimen
                </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};