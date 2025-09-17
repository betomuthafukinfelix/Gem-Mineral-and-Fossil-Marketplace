import React, { useState } from 'react';
import { GeologyIcon } from './icons/GeologyIcon';
import type { User } from '../types';

interface HeaderProps {
    currentUser: User | null;
    onLogout: () => void;
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onProfileClick: () => void;
    onHistoryClick: () => void;
    onInboxClick: () => void;
    onLogoClick: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

const ProfileIcon: React.FC<{ user: User }> = ({ user }) => {
    return (
        <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center text-cyan-200 font-bold overflow-hidden">
            {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
            ) : (
                <span>{user.username.charAt(0).toUpperCase()}</span>
            )}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onLoginClick, onRegisterClick, onProfileClick, onHistoryClick, onInboxClick, onLogoClick, searchTerm, onSearchChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <button onClick={onLogoClick} className="flex items-center cursor-pointer flex-shrink-0">
            <GeologyIcon className="h-10 w-10 text-cyan-400" />
            <span className="ml-3 text-2xl font-bold text-white tracking-wider hidden sm:inline">GeoMarket AI</span>
          </button>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#analyze" onClick={(e) => { e.preventDefault(); onLogoClick(); document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium">Analyze</a>
            <a href="#marketplace" onClick={(e) => { e.preventDefault(); onLogoClick(); document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium">Buy</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium">Sell</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium">Trade</a>
          </nav>
          
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div className="max-w-lg w-full lg:max-w-md">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative text-gray-400 focus-within:text-gray-200">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        id="search"
                        className="block w-full bg-slate-700/50 py-2 pl-10 pr-3 border border-slate-600 rounded-full leading-5 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
                        placeholder="Search for treasures..."
                        type="search"
                        name="search"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
          </div>


          <div className="hidden md:flex items-center">
            {currentUser ? (
                 <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2">
                        <ProfileIcon user={currentUser} />
                        <span className="text-white font-medium">{currentUser.username}</span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 border border-slate-700">
                           <button 
                             onClick={() => { onProfileClick(); setIsMenuOpen(false); }} 
                             className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                           >
                               Settings
                           </button>
                           <button 
                             onClick={() => { onHistoryClick(); setIsMenuOpen(false); }} 
                             className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                           >
                               Analysis History
                           </button>
                           <button 
                             onClick={() => { onInboxClick(); setIsMenuOpen(false); }} 
                             className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                           >
                               Inbox
                           </button>
                           <button 
                             onClick={() => { onLogout(); setIsMenuOpen(false); }} 
                             className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                           >
                               Logout
                           </button>
                        </div>
                    )}
                 </div>
            ) : (
                <div className="space-x-4">
                    <button onClick={onLoginClick} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium">Login</button>
                    <button onClick={onRegisterClick} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                        Register
                    </button>
                </div>
            )}
          </div>
          
          <button className="md:hidden text-gray-300 hover:text-cyan-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>
    </header>
  );
};