import React, { useState, useMemo } from 'react';
import type { Seller, MarketplaceItem } from '../types';
import { ProductCard, ListingDetailModal } from './Marketplace';

interface SellerProfileProps {
    seller: Seller;
    allItems: MarketplaceItem[];
    onBack: () => void;
    onInitiatePurchase: (item: MarketplaceItem) => void;
    onInitiateContact: (item: MarketplaceItem) => void;
}

export const SellerProfile: React.FC<SellerProfileProps> = ({ seller, allItems, onBack, onInitiatePurchase, onInitiateContact }) => {
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

    const sellerItems = useMemo(() => {
        return allItems.filter(item => item.seller.id === seller.id);
    }, [allItems, seller.id]);

    return (
        <>
            <section className="py-20 bg-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                            &larr; Back to Marketplace
                        </button>

                        <div className="flex flex-col sm:flex-row items-center bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-12">
                            <img src={seller.avatarUrl} alt={seller.name} className="w-32 h-32 rounded-full mr-0 sm:mr-8 mb-6 sm:mb-0 border-4 border-slate-600"/>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white text-center sm:text-left">{seller.name}</h1>
                                <p className="mt-2 text-lg text-gray-400 text-center sm:text-left">View all listings from this seller.</p>
                            </div>
                        </div>

                        {sellerItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {sellerItems.map(item => (
                                    <ProductCard key={item.id} item={item} onViewDetails={() => setSelectedItem(item)} />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center bg-slate-800 border border-slate-700 rounded-lg p-12">
                                <h3 className="text-xl font-semibold text-white">No Listings Found</h3>
                                <p className="text-gray-400 mt-2">{seller.name} doesn't have any items for sale at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {selectedItem && (
                <ListingDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onInitiatePurchase={onInitiatePurchase}
                    onInitiateContact={onInitiateContact}
                    // No onViewSellerProfile needed here since we are already on the profile page
                />
            )}
        </>
    );
};
