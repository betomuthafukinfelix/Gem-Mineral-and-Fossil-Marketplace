import React from 'react';
import type { AnalysisResult, AppraisalResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface AnalysisResultDisplayProps {
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  result: AnalysisResult | null;
  appraisal: AppraisalResult | null;
  imageFile: File | null;
  onAppraise: () => void;
  onList: () => void;
}

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center p-8">
    <div className="flex justify-center items-center mb-4">
        <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
    <h3 className="text-xl font-semibold text-white">{message}</h3>
    <p className="text-gray-400 mt-2">Our expert AI is examining your specimen. This may take a moment.</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
    <h3 className="text-xl font-semibold text-red-400">Analysis Error</h3>
    <p className="text-gray-300 mt-2">{message}</p>
  </div>
);

const AppraisalView: React.FC<{ appraisal: AppraisalResult }> = ({ appraisal }) => (
    <div className="mt-8 bg-slate-900/50 p-6 rounded-lg border border-purple-500/50 space-y-4">
        <h4 className="text-2xl font-bold text-purple-400 mb-3">AI Appraisal Report</h4>
        <div>
            <p className="text-sm font-medium text-gray-400">Estimated Value</p>
            <p className="text-3xl font-bold text-white">{appraisal.estimatedValueRange}</p>
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">Confidence Score</p>
            <p className="text-lg font-semibold text-white">{appraisal.confidenceScore} / 100</p>
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">Valuation Methodology</p>
            <p className="text-gray-300">{appraisal.valuationMethodology}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
                <h5 className="font-semibold text-green-400 mb-2">Positive Factors</h5>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {appraisal.positiveValueFactors.map((factor, i) => <li key={i}>{factor}</li>)}
                </ul>
            </div>
            <div>
                <h5 className="font-semibold text-yellow-400 mb-2">Considerations</h5>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {appraisal.negativeValueFactors.map((factor, i) => <li key={i}>{factor}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const ResultView: React.FC<{ 
    result: AnalysisResult; 
    appraisal: AppraisalResult | null;
    imageFile: File;
    isLoading: boolean;
    onAppraise: () => void;
    onList: () => void;
}> = ({ result, appraisal, imageFile, isLoading, onAppraise, onList }) => (
  <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700">
      <img src={URL.createObjectURL(imageFile)} alt="Analyzed specimen" className="w-full h-auto object-cover"/>
    </div>
    <div className="space-y-6">
      <div>
        <span className="inline-block bg-cyan-800 text-cyan-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-2">{result.specimenType}</span>
        <h3 className="text-3xl font-bold text-white mb-1">{result.commonName}</h3>
        <p className="text-lg text-gray-400 italic mb-2">{result.scientificName}</p>
        <p className="text-gray-300">{result.description}</p>
      </div>

      {result.specimenType === 'Fossil' && result.geologicalPeriod.toLowerCase() !== 'n/a' && (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-lg text-cyan-400 mb-2">Geological Period</h4>
            <p className="text-gray-300">{result.geologicalPeriod}</p>
        </div>
      )}

      {result.specimenType === 'Fossil' && result.fossilizationType.toLowerCase() !== 'n/a' && (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-lg text-cyan-400 mb-2">Fossilization Type</h4>
            <p className="text-gray-300">{result.fossilizationType}</p>
        </div>
      )}

      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h4 className="font-semibold text-lg text-cyan-400 mb-2">Geological Context</h4>
        <p className="text-gray-300">{result.geologicalContext}</p>
      </div>
      
      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h4 className="font-semibold text-lg text-cyan-400 mb-2">Initial Estimated Value</h4>
        <p className="text-2xl font-bold text-white">{result.estimatedValue}</p>
      </div>
      
      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h4 className="font-semibold text-lg text-cyan-400 mb-3 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Key Identifying Characteristics
        </h4>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
            {result.keyCharacteristics.map((note, index) => <li key={index}>{note}</li>)}
        </ul>
      </div>

      {/* Action Buttons & Appraisal View */}
      <div className="mt-2 pt-6 border-t border-slate-700">
          {!appraisal ? (
              <button onClick={onAppraise} disabled={isLoading} className="w-full inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                 <SparklesIcon className="mr-3 h-6 w-6" />
                 Get AI Appraisal
              </button>
          ) : (
              <button onClick={onList} className="w-full inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
                 Create Marketplace Listing
              </button>
          )}
          {appraisal && <AppraisalView appraisal={appraisal} />}
      </div>
    </div>
  </div>
);


export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ isLoading, loadingMessage, error, result, appraisal, imageFile, onAppraise, onList }) => {
  if (!isLoading && !error && !result) return null;

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">Analysis Report</h2>
        <div className="max-w-5xl mx-auto p-6 sm:p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
          {isLoading && <LoadingState message={loadingMessage || 'Loading...'} />}
          {error && !isLoading && <ErrorState message={error} />}
          {result && imageFile && !isLoading && 
            <ResultView 
                result={result} 
                imageFile={imageFile}
                appraisal={appraisal}
                isLoading={isLoading}
                onAppraise={onAppraise}
                onList={onList}
            />}
        </div>
      </div>
    </section>
  );
};
