import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { MarketplaceItem } from '../types';

// Extend the Window interface to include Stripe
declare global {
    interface Window {
        Stripe?: any;
    }
}

type CheckoutStep = 'shipping' | 'payment' | 'summary' | 'processing' | 'success';

interface CheckoutModalProps {
    item: MarketplaceItem;
    onClose: () => void;
    onConfirmPurchase: (item: MarketplaceItem) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const STRIPE_TEST_KEY = 'pk_test_51BTUDGJAJfZb9HEBwDgAbpr3JeM2lBmrY2RVaHwGkR9g8c3B4z0r2w51fDIrJEUg2x2o8p41D2a969Z9u3bT4yFm00G1gKPgXN';

const StepIndicator: React.FC<{ currentStep: CheckoutStep }> = ({ currentStep }) => {
    const steps = ['shipping', 'payment', 'summary'];
    const currentStepIndex = steps.indexOf(currentStep);

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {stepIdx < currentStepIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-cyan-600" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-cyan-600 rounded-full">
                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </>
                        ) : stepIdx === currentStepIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-slate-600" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-slate-700 rounded-full border-2 border-cyan-600">
                                    <span className="h-2.5 w-2.5 bg-cyan-600 rounded-full" aria-hidden="true" />
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-slate-600" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-slate-700 rounded-full border-2 border-slate-600" />
                            </>
                        )}
                        <span className="absolute top-10 w-max -ml-2 text-xs font-medium text-gray-400 capitalize">{step}</span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};


export const CheckoutModal: React.FC<CheckoutModalProps> = ({ item, onClose, onConfirmPurchase }) => {
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
    
    // Form States
    const [shippingInfo, setShippingInfo] = useState({ name: '', address: '', city: '', state: '', zip: '', country: 'USA' });
    const [error, setError] = useState<string | null>(null);

    // Stripe State
    const [stripe, setStripe] = useState<any>(null);
    const [elements, setElements] = useState<any>(null);
    const [cardElement, setCardElement] = useState<any>(null);
    const cardElementContainerRef = useRef<HTMLDivElement>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const itemPrice = useMemo(() => parseFloat(item.price.replace('$', '')), [item.price]);
    const shippingCost = useMemo(() => item.shippingCost || 15.00, [item.shippingCost]);
    const totalCost = useMemo(() => itemPrice + shippingCost, [itemPrice, shippingCost]);

    useEffect(() => {
        if (window.Stripe) {
            const stripeInstance = window.Stripe(STRIPE_TEST_KEY);
            setStripe(stripeInstance);
            setElements(stripeInstance.elements());
        } else {
            console.error("Stripe.js has not loaded yet.");
        }
    }, []);

    useEffect(() => {
        if (currentStep === 'payment' && elements && cardElementContainerRef.current) {
            if (cardElementContainerRef.current.childElementCount > 0) return; // Prevent re-mounting
            
            const card = elements.create('card', {
                style: {
                    base: {
                        color: '#f5f5dc', // parchment
                        fontFamily: '"Roboto", sans-serif',
                        fontSize: '16px',
                        '::placeholder': {
                            color: '#d1c9b3', // parchment-dark
                        },
                    },
                    invalid: {
                        color: '#c75b5b', // danger
                        iconColor: '#c75b5b',
                    },
                },
            });
            card.mount(cardElementContainerRef.current);
            setCardElement(card);
        }
    }, [currentStep, elements]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formSetter: React.Dispatch<React.SetStateAction<any>>) => {
        formSetter(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const validateAndProceed = async () => {
        setError(null);
        if (currentStep === 'shipping') {
            if (Object.values(shippingInfo).some(val => val.trim() === '')) {
                setError("Please fill out all shipping fields.");
                return;
            }
            setCurrentStep('payment');
        } else if (currentStep === 'payment') {
            if (!stripe || !cardElement) {
                setError("Payment gateway is not ready. Please wait a moment.");
                return;
            }
            setIsProcessingPayment(true);
            const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: { name: shippingInfo.name },
            });
            setIsProcessingPayment(false);

            if (paymentMethodError) {
                setError(paymentMethodError.message || "An error occurred with your card.");
                return;
            }
            
            // In a real app, send paymentMethod.id to your server for processing.
            // Here, we just simulate success and move to the summary.
            console.log('Created test PaymentMethod:', paymentMethod.id);
            setCurrentStep('summary');
        }
    };

    const handleFinalConfirm = () => {
        setCurrentStep('processing');
        // Simulate API call
        setTimeout(() => {
            setCurrentStep('success');
            setTimeout(() => {
                onConfirmPurchase(item);
            }, 1500); // Wait a bit on success screen before closing
        }, 2000);
    };

    const renderContent = () => {
        switch (currentStep) {
            case 'shipping':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Shipping Address</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                <input type="text" name="name" id="name" value={shippingInfo.name} onChange={e => handleFormChange(e, setShippingInfo)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                            </div>
                             <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Street Address</label>
                                <input type="text" name="address" id="address" value={shippingInfo.address} onChange={e => handleFormChange(e, setShippingInfo)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                            </div>
                             <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">City</label>
                                <input type="text" name="city" id="city" value={shippingInfo.city} onChange={e => handleFormChange(e, setShippingInfo)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                            </div>
                             <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">State / Province</label>
                                <input type="text" name="state" id="state" value={shippingInfo.state} onChange={e => handleFormChange(e, setShippingInfo)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                            </div>
                             <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-300 mb-1">ZIP / Postal Code</label>
                                <input type="text" name="zip" id="zip" value={shippingInfo.zip} onChange={e => handleFormChange(e, setShippingInfo)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                            </div>
                             <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                                <select name="country" id="country" value={shippingInfo.country} onChange={e => handleFormChange(e, setShippingInfo)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required>
                                    <option>USA</option>
                                    <option>Canada</option>
                                    <option>United Kingdom</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 'payment':
                 return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Payment Details</h3>
                        <p className="text-sm text-gray-400">All transactions are secure and encrypted.</p>
                        <div className="bg-slate-700 border border-slate-600 rounded-md p-3">
                            <div ref={cardElementContainerRef} />
                        </div>
                    </div>
                );
            case 'summary':
                return (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Order Summary</h3>
                        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Item: {item.name}</span>
                                <span className="font-medium text-white">{formatCurrency(itemPrice)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Shipping:</span>
                                <span className="font-medium text-white">{formatCurrency(shippingCost)}</span>
                            </div>
                             <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                                <span className="text-lg font-bold text-cyan-400">Total:</span>
                                <span className="text-lg font-bold text-cyan-400">{formatCurrency(totalCost)}</span>
                            </div>
                        </div>
                         <div className="bg-slate-700/50 rounded-lg p-4">
                            <h4 className="font-semibold text-white mb-2">Ship To:</h4>
                            <p className="text-gray-300">{shippingInfo.name}</p>
                            <p className="text-gray-300">{shippingInfo.address}</p>
                            <p className="text-gray-300">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
                         </div>
                    </div>
                );
            case 'processing':
                return (
                    <div className="text-center p-8 flex flex-col items-center justify-center h-48">
                        <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-xl font-semibold text-white">Processing Purchase...</h3>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center p-8 flex flex-col items-center justify-center h-48">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white">Purchase Confirmed!</h3>
                    </div>
                );
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Checkout</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal" disabled={currentStep === 'processing' || currentStep === 'success'}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-8">
                   <StepIndicator currentStep={currentStep} />
                </div>
                
                <div className="flex-grow overflow-y-auto px-8 pb-8">
                    {renderContent()}
                    {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
                </div>
                
                {(currentStep !== 'processing' && currentStep !== 'success') && (
                    <div className="flex justify-between items-center p-6 border-t border-slate-700 bg-slate-800/50 space-x-4">
                        <div>
                            {currentStep === 'payment' && <button onClick={() => setCurrentStep('shipping')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors">Back</button>}
                            {currentStep === 'summary' && <button onClick={() => setCurrentStep('payment')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors">Back</button>}
                        </div>
                        <div>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white font-medium py-2 px-4 rounded-full transition-colors">Cancel</button>
                            {currentStep !== 'summary' ? (
                                <button onClick={validateAndProceed} disabled={isProcessingPayment} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-full transition-colors ml-4 disabled:opacity-50 disabled:cursor-wait">
                                    {isProcessingPayment ? 'Validating...' : 'Next'}
                                </button>
                            ) : (
                                <button onClick={handleFinalConfirm} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors ml-4">
                                    Confirm Purchase
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};