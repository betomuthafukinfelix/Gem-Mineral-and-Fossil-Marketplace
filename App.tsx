import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Marketplace } from './components/Marketplace';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ProfileSettings } from './components/ProfileSettings';
import { AnalysisHistory } from './components/AnalysisHistory';
import { CreateListing } from './components/CreateListing';
import { CheckoutModal } from './components/CheckoutModal';
import { SellerProfile } from './components/SellerProfile';
import { ContactSellerModal } from './components/ContactSellerModal';
import { Inbox } from './components/Inbox';
import { analyzeSpecimen, appraiseSpecimen } from './services/geminiService';
import * as authService from './services/authService';
import * as historyService from './services/historyService';
import * as messagingService from './services/messagingService';
import { fileToBase64 } from './utils/fileUtils';
import type { AnalysisResult, User, AnalysisHistoryItem, AppraisalResult, MarketplaceItem, Seller, Message } from './types';

type View = 'main' | 'profile' | 'history' | 'sellerProfile' | 'inbox';

const sellers: { [key: string]: Seller } = {
  crystalCaverns: { id: 'seller1', name: 'CrystalCaverns', avatarUrl: 'https://i.pravatar.cc/150?u=seller1' },
  gemHunters: { id: 'seller2', name: 'GemHunters', avatarUrl: 'https://i.pravatar.cc/150?u=seller2' },
  paleoTreasures: { id: 'seller3', name: 'PaleoTreasures', avatarUrl: 'https://i.pravatar.cc/150?u=seller3' },
  ancientGemsCo: { id: 'seller4', name: 'AncientGemsCo', avatarUrl: 'https://i.pravatar.cc/150?u=seller4' },
  opalDreams: { id: 'seller5', name: 'OpalDreams', avatarUrl: 'https://i.pravatar.cc/150?u=seller5' },
};

const initialMarketplaceItems: MarketplaceItem[] = [
  {
    id: 1,
    name: 'Polished Amethyst Geode',
    price: '$250',
    shippingCost: 25.00,
    imageUrl: 'https://picsum.photos/seed/amethyst/500/500',
    description: 'A stunning, high-quality amethyst geode from Brazil, polished to reveal its deep purple crystals. Perfect as a centerpiece for any collection or home decor. Measures 8" tall.',
    seller: sellers.crystalCaverns,
    isNew: true,
  },
  {
    id: 2,
    name: 'Raw Emerald Cluster',
    price: '$780',
    shippingCost: 45.50,
    imageUrl: 'https://picsum.photos/seed/emerald/500/500',
    description: 'A vibrant raw emerald cluster from the famous mines of Colombia. The rich green color is all-natural. An excellent specimen for collectors of fine minerals. Weighs 150 grams.',
    seller: sellers.gemHunters,
  },
  {
    id: 3,
    name: 'Trilobite Fossil Plate',
    price: '$95',
    shippingCost: 15.00,
    onSale: '$120',
    imageUrl: 'https://picsum.photos/seed/fossil/500/500',
    description: 'An authentic Elrathia kingii trilobite fossil from the Cambrian period, found in Utah, USA. The plate contains multiple well-preserved specimens. A true piece of ancient history.',
    seller: sellers.paleoTreasures,
  },
  {
    id: 4,
    name: 'Lapis Lazuli Sphere',
    price: '$340',
    shippingCost: 22.00,
    imageUrl: 'https://picsum.photos/seed/lapis/500/500',
    description: 'A perfectly polished sphere of deep blue Lapis Lazuli from Afghanistan, flecked with golden pyrite. This piece radiates serene energy and has been prized by royalty for centuries.',
    seller: sellers.ancientGemsCo,
  },
  {
    id: 5,
    name: 'Fire Opal Specimen',
    price: '$1,200',
    shippingCost: 75.00,
    imageUrl: 'https://picsum.photos/seed/opal/500/500',
    description: 'An exceptional fire opal from Mexico, showcasing a brilliant play-of-color with flashes of red, orange, and green. This is a collector-grade, untreated specimen.',
    seller: sellers.opalDreams,
    isNew: true,
  },
  {
    id: 6,
    name: 'Aquamarine Crystal',
    price: '$450',
    shippingCost: 30.00,
    imageUrl: 'https://picsum.photos/seed/aquamarine/500/500',
    description: 'A terminated aquamarine crystal with excellent clarity and a classic hexagonal form. Sourced from the mountains of Pakistan, this piece has a beautiful light-blue hue.',
    seller: sellers.crystalCaverns,
  },
  {
    id: 7,
    name: 'Pyrite "Fool\'s Gold"',
    price: '$85',
    shippingCost: 18.00,
    onSale: '$100',
    imageUrl: 'https://picsum.photos/seed/pyrite/500/500',
    description: 'A large, impressive cluster of cubic pyrite crystals from the renowned mines of Navajún, Spain. Its metallic luster and sharp geometric shapes make it a stunning display piece.',
    seller: sellers.gemHunters,
  },
  {
    id: 8,
    name: 'Rose Quartz Tower',
    price: '$110',
    shippingCost: 16.50,
    imageUrl: 'https://picsum.photos/seed/rosequartz/500/500',
    description: 'A beautifully carved and polished tower of Madagascan rose quartz. Known as the stone of unconditional love, its gentle pink energy makes a wonderful addition to any space.',
    seller: sellers.ancientGemsCo,
  }
];

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [appraisalResult, setAppraisalResult] = useState<AppraisalResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<View>('main');
  
  const [isListingCreatorOpen, setIsListingCreatorOpen] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(initialMarketplaceItems);
  const [purchaseConfirmation, setPurchaseConfirmation] = useState<string | null>(null);
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [itemToPurchase, setItemToPurchase] = useState<MarketplaceItem | null>(null);
  
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [itemToContactAbout, setItemToContactAbout] = useState<MarketplaceItem | null>(null);
  const [messageConfirmation, setMessageConfirmation] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const resetAnalysisState = () => {
    setAnalysisResult(null);
    setAppraisalResult(null);
    setImageFile(null);
    setError(null);
  };

  const handleAnalyze = async (file: File, prompt: string) => {
    resetAnalysisState();
    setIsLoading(true);
    setLoadingMessage('Analyzing Specimen...');
    setAnalysisResult(null);
    setImageFile(file);
    setCurrentView('main');

    try {
      const result = await analyzeSpecimen(file, prompt);
      setAnalysisResult(result);

      if (currentUser) {
        const imageBase64 = await fileToBase64(file);
        const historyItem: AnalysisHistoryItem = {
          id: new Date().toISOString() + Math.random(),
          date: new Date().toISOString(),
          imageBase64: imageBase64,
          result: result,
        };
        historyService.addHistoryItem(currentUser.id, historyItem);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}. Please try again.`);
      } else {
        setError('An unknown error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppraise = async () => {
    if (!imageFile || !analysisResult) return;
    
    setIsLoading(true);
    setLoadingMessage('Appraising Specimen...');
    setError(null);

    try {
      const result = await appraiseSpecimen(imageFile, analysisResult);
      setAppraisalResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Appraisal failed: ${err.message}. Please try again.`);
      } else {
        setError('An unknown error occurred during appraisal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishListing = (newItem: Omit<MarketplaceItem, 'id' | 'seller'>) => {
    if (!currentUser) {
        alert("Please log in to create a listing.");
        openAuthModal('login');
        return;
    }

    const listing: MarketplaceItem = {
        ...newItem,
        id: Date.now(),
        seller: {
            id: `user-${currentUser.id}`,
            name: currentUser.username,
            avatarUrl: currentUser.profilePicture || `https://i.pravatar.cc/150?u=${currentUser.id}`
        }
    };
    
    setMarketplaceItems(prevItems => [listing, ...prevItems]);
    setIsListingCreatorOpen(false);
    resetAnalysisState();
    
    setTimeout(() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  
  const handleRegister = async (username: string, email: string, password: string, profilePicture: File | null) => {
      const newUser = await authService.register(username, email, password, profilePicture);
      setCurrentUser(newUser);
      setIsAuthModalOpen(false);
  };
  
  const handleLogin = async (email: string, password: string) => {
      const user = authService.login(email, password);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
      authService.logout();
      setCurrentUser(null);
      setCurrentView('main');
  };
  
  const handleUpdateProfile = async (username: string, email: string, profilePicture: File | null) => {
      if (!currentUser) return;
      const updatedUser = await authService.updateUser(currentUser.id, { username, email, profilePictureFile: profilePicture });
      setCurrentUser(updatedUser);
      return updatedUser;
  };

  const handleInitiatePurchase = (item: MarketplaceItem) => {
    if (!currentUser) {
        openAuthModal('login');
        return;
    }
    setItemToPurchase(item);
    setIsCheckoutModalOpen(true);
  };
  
  const handleConfirmPurchase = (itemToBuy: MarketplaceItem) => {
    setIsCheckoutModalOpen(false);
    setItemToPurchase(null);
    setMarketplaceItems(prevItems => prevItems.filter(item => item.id !== itemToBuy.id));
    setPurchaseConfirmation(`Success! You've purchased the "${itemToBuy.name}".`);
    setTimeout(() => {
        setPurchaseConfirmation(null);
    }, 5000); // Hide message after 5 seconds
  };
  
  const handleViewSellerProfile = (seller: Seller) => {
      setSelectedSeller(seller);
      setCurrentView('sellerProfile');
  };

  const handleInitiateContact = (item: MarketplaceItem) => {
    if (!currentUser) {
        openAuthModal('login');
        return;
    }
    setItemToContactAbout(item);
    setIsContactModalOpen(true);
  };
  
  const handleSendMessage = async (messageBody: string) => {
      if (!currentUser || !itemToContactAbout) return;
      
      const message: Message = {
        id: new Date().toISOString() + Math.random(),
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        recipientId: itemToContactAbout.seller.id,
        itemId: itemToContactAbout.id,
        itemName: itemToContactAbout.name,
        body: messageBody,
        timestamp: new Date().toISOString(),
      };
      // For demo, if user sends message to themselves, store it under their own ID
      const recipientId = itemToContactAbout.seller.id.startsWith('user-') ? itemToContactAbout.seller.id.replace('user-','') : itemToContactAbout.seller.id;
      messagingService.sendMessage(recipientId, message);
      
      setIsContactModalOpen(false);
      
      setMessageConfirmation(`Your message about "${itemToContactAbout.name}" has been sent!`);
      setTimeout(() => {
        setMessageConfirmation(null);
        setItemToContactAbout(null);
      }, 5000);
  };


  const openAuthModal = (mode: 'login' | 'register') => {
      setAuthMode(mode);
      setIsAuthModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
        return marketplaceItems;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return marketplaceItems.filter(item =>
        item.name.toLowerCase().includes(lowercasedTerm) ||
        item.description.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, marketplaceItems]);
  
  const renderContent = () => {
    if (currentView === 'profile' && currentUser) {
        return <ProfileSettings 
                    user={currentUser} 
                    onUpdateProfile={handleUpdateProfile} 
                    onBack={() => setCurrentView('main')}
                />
    }
    if (currentView === 'history' && currentUser) {
        return <AnalysisHistory
                    user={currentUser}
                    onBack={() => setCurrentView('main')}
                />
    }
    if (currentView === 'inbox' && currentUser) {
        return <Inbox
                    user={currentUser}
                    onBack={() => setCurrentView('main')}
                />
    }
    if (currentView === 'sellerProfile' && selectedSeller) {
        return <SellerProfile
                    seller={selectedSeller}
                    allItems={marketplaceItems}
                    onBack={() => {
                        setCurrentView('main');
                        setSelectedSeller(null);
                    }}
                    onInitiatePurchase={handleInitiatePurchase}
                    onInitiateContact={handleInitiateContact}
                />
    }
    return (
        <>
            <Hero onAnalyze={handleAnalyze} isLoading={isLoading} />
            {(isLoading || error || analysisResult) && (
              <AnalysisResultDisplay
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                error={error}
                result={analysisResult}
                appraisal={appraisalResult}
                imageFile={imageFile}
                onAppraise={handleAppraise}
                onList={() => setIsListingCreatorOpen(true)}
              />
            )}
            <Marketplace 
                items={filteredItems} 
                onInitiatePurchase={handleInitiatePurchase} 
                onViewSellerProfile={handleViewSellerProfile}
                onInitiateContact={handleInitiateContact}
            />
        </>
    );
  };

  return (
    <div className="bg-slate-900 min-h-screen text-gray-200">
      {purchaseConfirmation && (
          <div className="fixed top-5 right-5 bg-green-600 text-white py-3 px-6 rounded-lg shadow-lg z-[100] animate-fade-in-out">
              <p>{purchaseConfirmation}</p>
          </div>
      )}
       {messageConfirmation && (
          <div className="fixed top-5 right-5 bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg z-[100] animate-fade-in-out">
              <p>{messageConfirmation}</p>
          </div>
      )}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => openAuthModal('login')}
        onRegisterClick={() => openAuthModal('register')}
        onProfileClick={() => setCurrentView('profile')}
        onHistoryClick={() => setCurrentView('history')}
        onInboxClick={() => setCurrentView('inbox')}
        onLogoClick={() => {
            setCurrentView('main');
            resetAnalysisState();
            setSearchTerm('');
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      {isAuthModalOpen && (
        <AuthModal
            mode={authMode}
            onClose={() => setIsAuthModalOpen(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
        />
      )}
      {isListingCreatorOpen && analysisResult && appraisalResult && imageFile && (
        <CreateListing
            analysisResult={analysisResult}
            appraisalResult={appraisalResult}
            imageFile={imageFile}
            onClose={() => setIsListingCreatorOpen(false)}
            onPublish={handlePublishListing}
        />
      )}
      {isCheckoutModalOpen && itemToPurchase && (
        <CheckoutModal
          item={itemToPurchase}
          onClose={() => setIsCheckoutModalOpen(false)}
          onConfirmPurchase={handleConfirmPurchase}
        />
      )}
      {isContactModalOpen && itemToContactAbout && (
        <ContactSellerModal
            item={itemToContactAbout}
            onClose={() => setIsContactModalOpen(false)}
            onSendMessage={handleSendMessage}
        />
      )}
      <main>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;