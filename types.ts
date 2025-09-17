export interface AnalysisResult {
  scientificName: string;
  commonName: string;
  specimenType: 'Fossil' | 'Gemstone' | 'Mineral' | 'Other';
  description: string;
  geologicalContext: string;
  geologicalPeriod: string; // "N/A" for non-fossils
  fossilizationType: string; // "N/A" for non-fossils
  estimatedValue: string;
  keyCharacteristics: string[];
}

export interface AppraisalResult {
  estimatedValueRange: string;
  confidenceScore: number;
  valuationMethodology: string;
  positiveValueFactors: string[];
  negativeValueFactors: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  profilePicture: string | null; // Base64 encoded string
}

export interface AnalysisHistoryItem {
    id: string;
    date: string;
    imageBase64: string;
    result: AnalysisResult;
}

export interface Seller {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface MarketplaceItem {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    description: string;
    seller: Seller;
    isNew?: boolean;
    onSale?: string; // Original price
    shippingCost?: number;
}

export interface Message {
    id: string;
    senderId: string;
    senderUsername: string;
    recipientId: string; // The seller's ID
    itemId: number;
    itemName: string;
    body: string;
    timestamp: string;
}

export interface Conversation {
    senderId: string;
    senderUsername: string;
    messages: Message[];
}
