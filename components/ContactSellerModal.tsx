import React, { useState } from 'react';
import type { MarketplaceItem } from '../types';

interface ContactSellerModalProps {
    item: MarketplaceItem;
    onClose: () => void;
    onSendMessage: (messageBody: string) => Promise<void>;
}

export const ContactSellerModal: React.FC<ContactSellerModalProps> = ({ item, onClose, onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Message cannot be empty.');
            return;
        }
        setIsSending(true);
        setError(null);
        try {
            await onSendMessage(message);
            setIsSending(false);
            setIsSent(true);
            setTimeout(() => {
                onClose();
            }, 1500); // Close modal after 1.5s
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Contact Seller</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">To: <span className="font-semibold text-gray-200">{item.seller.name}</span></p>
                            <p className="text-sm text-gray-400">Regarding: <span className="font-semibold text-gray-200">{item.name}</span></p>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Your Message</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                                rows={6}
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder={`Hi ${item.seller.name}, I'm interested in the ${item.name}...`}
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>

                    <div className="flex justify-end items-center p-6 border-t border-slate-700 bg-slate-800/50 space-x-4">
                        <button type="button" onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending || isSent}
                            className="inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : isSent ? 'Message Sent!' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
