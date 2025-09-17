
import React, { useState, useEffect } from 'react';
import type { AnalysisResult, AppraisalResult, MarketplaceItem } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface CreateListingProps {
    analysisResult: AnalysisResult;
    appraisalResult: AppraisalResult;
    imageFile: File;
    onClose: () => void;
    onPublish: (item: Omit<MarketplaceItem, 'id' | 'seller'>) => void;
}

// Helper to extract the lower bound price from a string like "$150 - $250"
const getSuggestedPrice = (range: string): string => {
    const match = range.match(/\d+/);
    return match ? match[0] : '100';
};

export const CreateListing: React.FC<CreateListingProps> = ({
    analysisResult,
    appraisalResult,
    imageFile,
    onClose,
    onPublish,
}) => {
    const [title, setTitle] = useState(analysisResult.commonName);
    const [description, setDescription] = useState(analysisResult.description);
    const [price, setPrice] = useState(getSuggestedPrice(appraisalResult.estimatedValueRange));
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreviewUrl(objectUrl);
        
        // Clean up the object URL on component unmount
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (!title || !price || !description) {
                throw new Error("All fields must be filled out.");
            }
            const imageBase64 = await fileToBase64(imageFile);
            onPublish({
                name: title,
                price: `$${price}`,
                description: description,
                imageUrl: imageBase64,
                isNew: true,
            });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while publishing.");
            }
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Create Marketplace Listing</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 p-8">
                        {/* Image Column */}
                        <div className="space-y-4">
                             <label className="block text-sm font-medium text-gray-300 mb-1">Listing Image</label>
                            {imagePreviewUrl && (
                                <img src={imagePreviewUrl} alt="Specimen for listing" className="w-full h-auto object-cover rounded-lg shadow-md border border-slate-700" />
                            )}
                        </div>

                        {/* Form Fields Column */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Price (USD)</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-400 sm:text-sm">$</span>
                                    </div>
                                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min="0" className="w-full p-3 pl-7 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={8} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                             {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        </div>
                    </form>
                </div>
                
                <div className="flex justify-end items-center p-6 border-t border-slate-700 bg-slate-800/50 space-x-4">
                     <button type="button" onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Publishing...
                            </>
                        ) : (
                            'Publish Listing'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
