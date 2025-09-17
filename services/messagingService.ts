import type { Message, Conversation } from '../types';

const MESSAGES_KEY = 'geo_market_messages';

type MessageStore = {
    [sellerId: string]: Message[];
};

export const sendMessage = (sellerId: string, message: Message): void => {
    const messagesJson = localStorage.getItem(MESSAGES_KEY);
    let allMessages: MessageStore = {};
    if (messagesJson) {
        try {
            allMessages = JSON.parse(messagesJson) as MessageStore;
        } catch (e) {
            console.error("Could not parse existing messages, starting fresh.", e);
            allMessages = {};
        }
    }

    if (!allMessages[sellerId]) {
        allMessages[sellerId] = [];
    }
    
    allMessages[sellerId].unshift(message);

    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
};

export const getMessagesForSeller = (sellerId: string): Message[] => {
    const messagesJson = localStorage.getItem(MESSAGES_KEY);
    if (!messagesJson) return [];
    try {
        const allMessages = JSON.parse(messagesJson) as MessageStore;
        return allMessages[sellerId] || [];
    } catch (e) {
        console.error("Failed to parse messages from localStorage", e);
        return [];
    }
};

export const getConversationsForSeller = (sellerId: string): Conversation[] => {
    const messages = getMessagesForSeller(sellerId);
    if (!messages.length) return [];

    const conversationsMap = new Map<string, Conversation>();

    messages.forEach(message => {
        const existingConversation = conversationsMap.get(message.senderId);
        if (existingConversation) {
            existingConversation.messages.push(message);
        } else {
            conversationsMap.set(message.senderId, {
                senderId: message.senderId,
                senderUsername: message.senderUsername,
                messages: [message],
            });
        }
    });

    // Sort messages within each conversation by timestamp (oldest first for viewing)
    conversationsMap.forEach(conversation => {
        conversation.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    return Array.from(conversationsMap.values());
};
