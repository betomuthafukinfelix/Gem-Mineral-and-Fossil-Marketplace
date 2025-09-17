import React, { useState, useEffect } from 'react';
import type { User, Conversation, Message } from '../types';
import * as messagingService from '../services/messagingService';

const MessageDetailModal: React.FC<{ conversation: Conversation; onClose: () => void }> = ({ conversation, onClose }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Conversation with {conversation.senderUsername}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {conversation.messages.map(message => (
                        <div key={message.id} className="bg-slate-700/50 rounded-lg p-4">
                            <div className="flex justify-between items-baseline mb-2">
                                <p className="font-semibold text-cyan-400">Item: {message.itemName}</p>
                                <p className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleString()}</p>
                            </div>
                            <p className="text-gray-200">{message.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


interface InboxProps {
    user: User;
    onBack: () => void;
}

export const Inbox: React.FC<InboxProps> = ({ user, onBack }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    useEffect(() => {
        const userConversations = messagingService.getConversationsForSeller(user.id);
        setConversations(userConversations);
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
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Inbox</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                                Messages from potential buyers.
                            </p>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                            {conversations.length > 0 ? (
                                <ul className="divide-y divide-slate-700">
                                    {conversations.map(convo => {
                                        const latestMessage = convo.messages[convo.messages.length - 1];
                                        return (
                                            <li key={convo.senderId} onClick={() => setSelectedConversation(convo)} className="p-6 hover:bg-slate-700/50 cursor-pointer transition-colors duration-200">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-lg text-white">{convo.senderUsername}</p>
                                                        <p className="text-sm text-cyan-400 truncate">Regarding: {latestMessage.itemName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-400">{new Date(latestMessage.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center p-12">
                                    <h3 className="text-xl font-semibold text-white">Your Inbox is Empty</h3>
                                    <p className="text-gray-400 mt-2">You haven't received any messages yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {selectedConversation && (
                <MessageDetailModal 
                    conversation={selectedConversation} 
                    onClose={() => setSelectedConversation(null)} 
                />
            )}
        </>
    );
};
