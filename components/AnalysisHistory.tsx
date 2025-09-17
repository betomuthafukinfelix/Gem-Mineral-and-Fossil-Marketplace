import React, { useState, useEffect } from 'react';
import type { User, AnalysisHistoryItem, AnalysisResult } from '../types';
import * as historyService from '../services/historyService';
import { SparklesIcon } from './icons/SparklesIcon';

const HistoryDetailModal: React.FC<{ item: AnalysisHistoryItem; onClose: () => void }> = ({ item, onClose }) => {
    const { result, imageBase64 } = item;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close modal">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="p-8">
                     <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                        <div className="bg-slate-900 rounded-lg overflow-hidden shadow-lg border border-slate-700">
                            <img src={imageBase64} alt="Analyzed specimen" className="w-full h-auto object-cover"/>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <span className="inline-block bg-cyan-800 text-cyan-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-2">{result.specimenType}</span>
                                <h3 className="text-3xl font-bold text-white mb-1">{result.commonName}</h3>
                                <p className="text-lg text-gray-400 italic mb-2">{result.scientificName}</p>
                                <p className="text-gray-300">{result.description}</p>
                            </div>
                            
                            {result.specimenType === 'Fossil' && result.geologicalPeriod.toLowerCase() !== 'n/a' && (
                                <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">Geological Period</h4>
                                    <p className="text-gray-300">{result.geologicalPeriod}</p>
                                </div>
                            )}

                            {result.specimenType === 'Fossil' && result.fossilizationType.toLowerCase() !== 'n/a' && (
                                <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">Fossilization Type</h4>
                                    <p className="text-gray-300">{result.fossilizationType}</p>
                                </div>
                             )}

                            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                <h4 className="font-semibold text-lg text-cyan-400 mb-2">Geological Context</h4>
                                <p className="text-gray-300">{result.geologicalContext}</p>
                            </div>
                            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                <h4 className="font-semibold text-lg text-cyan-400 mb-2">Estimated Value</h4>
                                <p className="text-2xl font-bold text-white">{result.estimatedValue}</p>
                            </div>
                            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                <h4 className="font-semibold text-lg text-cyan-400 mb-3 flex items-center">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Key Identifying Characteristics
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-gray-300">
                                    {result.keyCharacteristics.map((note, index) => <li key={index}>{note}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const HistoryCard: React.FC<{ item: AnalysisHistoryItem; onViewReport: () => void }> = ({ item, onViewReport }) => (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-cyan-500/50 group transition-all duration-300 transform hover:-translate-y-1">
        <div className="overflow-hidden aspect-square">
            <img src={item.imageBase64} alt={item.result.commonName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-5">
            <h3 className="text-lg font-semibold text-white truncate">{item.result.commonName}</h3>
            <p className="text-sm text-gray-400 mt-1">{new Date(item.date).toLocaleDateString()}</p>
            <button onClick={onViewReport} className="mt-4 w-full bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                View Report
            </button>
        </div>
    </div>
);


interface AnalysisHistoryProps {
    user: User;
    onBack: () => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ user, onBack }) => {
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);

    useEffect(() => {
        const userHistory = historyService.getHistory(user.id);
        setHistory(userHistory);
    }, [user.id]);

    return (
        <>
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                            &larr; Back to Marketplace
                        </button>
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Analysis History</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                                Review your previously analyzed specimens.
                            </p>
                        </div>

                        {history.length > 0 ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                {history.map((item) => (
                                    <HistoryCard key={item.id} item={item} onViewReport={() => setSelectedItem(item)} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center bg-slate-800 border border-slate-700 rounded-lg p-12">
                                <h3 className="text-xl font-semibold text-white">No History Found</h3>
                                <p className="text-gray-400 mt-2">You haven't analyzed any specimens yet. Start by uploading an image on the main page!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {selectedItem && <HistoryDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </>
    );
};