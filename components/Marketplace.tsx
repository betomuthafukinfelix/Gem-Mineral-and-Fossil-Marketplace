import React, { useState } from 'react';
import type { MarketplaceItem, Seller } from '../types';

interface MarketplaceProps {
    items: MarketplaceItem[];
    onInitiatePurchase: (item: MarketplaceItem) => void;
    onViewSellerProfile: (seller: Seller) => void;
    onInitiateContact: (item: MarketplaceItem) => void;
}

interface ListingDetailModalProps {
    item: MarketplaceItem;
    onClose: () => void;
    onInitiatePurchase: (item: MarketplaceItem) => void;
    onInitiateContact: (item: MarketplaceItem) => void;
    onViewSellerProfile?: (seller: Seller) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ item, onClose, onInitiatePurchase, onInitiateContact, onViewSellerProfile }) => {
    const handleSellerClick = () => {
        if (onViewSellerProfile) {
            onClose(); // Close the current modal before navigating
            onViewSellerProfile(item.seller);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close modal">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="w-full md:w-1/2 h-64 md:h-auto">
                    <img src={item.imageUrl.replace('/500/500', '/800/800')} alt={item.name} className="w-full h-full object-cover"/>
                </div>
                <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                    <h2 className="text-3xl font-bold text-white mb-2">{item.name}</h2>
                    <div className="flex items-baseline mb-6">
                        <p className="text-3xl font-bold text-cyan-400">{item.price}</p>
                        {item.onSale && (
                            <p className="ml-3 text-xl text-gray-500 line-through">{item.onSale}</p>
                        )}
                    </div>
                    <p className="text-gray-300 mb-6">{item.description}</p>
    
                    <div className="bg-slate-700/50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-lg text-gray-200 mb-3">Seller Information</h3>
                        <div
                            className={`flex items-center ${onViewSellerProfile ? 'cursor-pointer hover:bg-slate-700 -m-2 p-2 rounded-lg transition-colors' : ''}`}
                            onClick={handleSellerClick}
                            onKeyDown={(e) => e.key === 'Enter' && handleSellerClick()}
                            role={onViewSellerProfile ? "button" : undefined}
                            tabIndex={onViewSellerProfile ? 0 : -1}
                            aria-label={onViewSellerProfile ? `View profile for ${item.seller.name}` : undefined}
                        >
                            <img src={item.seller.avatarUrl} alt={item.seller.name} className="w-12 h-12 rounded-full mr-4"/>
                            <div>
                                <p className="font-bold text-white">{item.seller.name}</p>
                                {onViewSellerProfile && <span className="text-sm text-cyan-400 hover:underline">View Profile</span>}
                            </div>
                        </div>
                    </div>
    
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                         <button onClick={() => onInitiatePurchase(item)} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                            Buy Now
                        </button>
                         <button onClick={() => onInitiateContact(item)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300">
                            Contact Seller
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const ProductCard: React.FC<{ item: MarketplaceItem; onViewDetails: () => void }> = ({ item, onViewDetails }) => (
    <div className="relative bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-cyan-500/50 group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
        {item.onSale ? (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10">
                Sale
            </div>
        ) : item.isNew && (
            <div className="absolute top-3 right-3 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10">
                New
            </div>
        )}
        <div className="overflow-hidden">
            <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover transition-transform duration-300" />
        </div>
        <div className="p-5">
            <h3 className="text-lg font-semibold text-white truncate">{item.name}</h3>
            <div className="flex items-baseline mt-2">
                <p className="text-xl font-bold text-cyan-400">{item.price}</p>
                 {item.onSale && (
                    <p className="ml-2 text-base text-gray-500 line-through">{item.onSale}</p>
                )}
            </div>
            <button onClick={onViewDetails} className="mt-4 w-full bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                View Details
            </button>
        </div>
    </div>
);

export const Marketplace: React.FC<MarketplaceProps> = ({ items, onInitiatePurchase, onViewSellerProfile, onInitiateContact }) => {
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

    return (
        <>
            <section id="marketplace" className="py-20 bg-slate-900/70">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">Specimen Marketplace</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                            Discover rare and beautiful gems, minerals, and fossils from collectors around the world.
                        </p>
                    </div>
                    {items.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {items.map(item => (
                                <ProductCard key={item.id} item={item} onViewDetails={() => setSelectedItem(item)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center bg-slate-800 border border-slate-700 rounded-lg p-12 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-semibold text-white">No Treasures Found</h3>
                            <p className="text-gray-400 mt-2">Your search didn't match any of our current listings. Try a different term or clear your search!</p>
                        </div>
                    )}
                </div>
            </section>
            {selectedItem && <ListingDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onInitiatePurchase={onInitiatePurchase} onViewSellerProfile={onViewSellerProfile} onInitiateContact={onInitiateContact} />}
        </>
    );
};