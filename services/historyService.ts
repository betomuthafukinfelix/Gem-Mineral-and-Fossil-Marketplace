import type { AnalysisHistoryItem } from '../types';

const ANALYSIS_HISTORY_KEY = 'geo_market_analysis_history';

type HistoryStore = {
    [userId: string]: AnalysisHistoryItem[];
};

export const getHistory = (userId: string): AnalysisHistoryItem[] => {
    const historyJson = localStorage.getItem(ANALYSIS_HISTORY_KEY);
    if (!historyJson) return [];
    try {
        const allHistories = JSON.parse(historyJson) as HistoryStore;
        return allHistories[userId] || [];
    } catch (e) {
        console.error("Failed to parse analysis history from localStorage", e);
        return [];
    }
};

export const addHistoryItem = (userId: string, item: AnalysisHistoryItem): void => {
    const historyJson = localStorage.getItem(ANALYSIS_HISTORY_KEY);
    let allHistories: HistoryStore = {};
    if (historyJson) {
        try {
            allHistories = JSON.parse(historyJson) as HistoryStore;
        } catch (e) {
            console.error("Could not parse existing history, starting fresh.", e);
            allHistories = {};
        }
    }

    if (!allHistories[userId]) {
        allHistories[userId] = [];
    }
    
    // Add new item to the beginning of the list
    allHistories[userId].unshift(item);

    localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(allHistories));
};
