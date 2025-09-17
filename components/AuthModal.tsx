

import React, { useState } from 'react';
import type { User } from '../types';
import { ImageUploader } from './ImageUploader';
import { SparklesIcon } from './icons/SparklesIcon';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string, profilePicture: File | null) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onLogin, onRegister }) => {
  const [activeTab, setActiveTab] = useState(mode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'register') {
        if (!username || !email || !password) {
            throw new Error("Please fill in all required fields.");
        }
        await onRegister(username, email, password, profilePicture);
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md max-h-full overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div className="p-8">
          <div className="flex border-b border-slate-700 mb-6">
            <button onClick={() => setActiveTab('login')} className={`py-3 px-6 text-lg font-medium transition-colors ${activeTab === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
              Login
            </button>
            <button onClick={() => setActiveTab('register')} className={`py-3 px-6 text-lg font-medium transition-colors ${activeTab === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'register' && (
               <>
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-400 mb-2">Profile Picture (Optional)</p>
                    {/* FIX: The onError prop is required by ImageUploader. Pass the setError state setter to handle file upload errors. */}
                    <ImageUploader onFileChange={setProfilePicture} onError={setError} />
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                    <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
               </>
            )}
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
             <div>
                <label htmlFor="password"  className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
             {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
                <>
                   {activeTab === 'register' ? 'Create Account' : 'Login'}
                </>
            )}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
};