import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { ImageUploader } from './ImageUploader';

interface ProfileSettingsProps {
    user: User;
    onUpdateProfile: (username: string, email: string, profilePicture: File | null) => Promise<User>;
    onBack: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateProfile, onBack }) => {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(user.profilePicture);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFileChange = (file: File | null) => {
        setProfilePictureFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(user.profilePicture); // Revert to original if file is cleared
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await onUpdateProfile(username, email, profilePictureFile);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                     <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                        &larr; Back to Marketplace
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Profile Settings</h1>
                    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                                <div className="flex items-center space-x-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                                        {preview ? (
                                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{username.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <label htmlFor="profile-picture-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                        Change Picture
                                    </label>
                                    <input id="profile-picture-upload" type="file" className="sr-only" accept="image/*" onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                                <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            {success && <p className="text-green-400 text-sm text-center">{success}</p>}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};
