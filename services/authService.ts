import type { User } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

const USERS_KEY = 'geo_market_users';
const CURRENT_USER_KEY = 'geo_market_current_user';

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    try {
        return JSON.parse(userJson) as User;
    } catch (e) {
        console.error("Failed to parse current user from localStorage", e);
        return null;
    }
};

export const register = async (
    username: string, 
    email: string, 
    password: string, 
    profilePictureFile: File | null
): Promise<User> => {
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    if (users.some(user => user.email === email)) {
        throw new Error("A user with this email already exists.");
    }
    
    let profilePicture: string | null = null;
    if (profilePictureFile) {
        profilePicture = await fileToBase64(profilePictureFile);
    }
    
    // NOTE: In a real app, never store plain text passwords. Hash and salt them.
    const newUser: User = {
        id: new Date().toISOString() + Math.random(),
        username,
        email,
        passwordHash: password, // This is insecure, for demonstration only.
        profilePicture,
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return newUser;
};

export const login = (email: string, password: string): User => {
    const usersJson = localStorage.getItem(USERS_KEY);
    if (!usersJson) {
        throw new Error("Invalid email or password.");
    }
    
    const users: User[] = JSON.parse(usersJson);
    const user = users.find(u => u.email === email && u.passwordHash === password);

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
};

export const logout = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

interface UpdateUserData {
    username: string;
    email: string;
    profilePictureFile: File | null;
}

export const updateUser = async (userId: string, data: UpdateUserData): Promise<User> => {
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found.");
    }
    
    const existingUser = users[userIndex];
    
    // Check if the new email is already taken by another user
    if (users.some(u => u.email === data.email && u.id !== userId)) {
        throw new Error("This email is already in use by another account.");
    }
    
    let profilePicture = existingUser.profilePicture;
    if (data.profilePictureFile) {
        profilePicture = await fileToBase64(data.profilePictureFile);
    }

    const updatedUser: User = {
        ...existingUser,
        username: data.username,
        email: data.email,
        profilePicture: profilePicture
    };

    users[userIndex] = updatedUser;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also update the currently logged-in user's data
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
    
    return updatedUser;
};