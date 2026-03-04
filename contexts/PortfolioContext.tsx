'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db, doc, setDoc, onSnapshot, collection, deleteDoc } from '../lib/firebase';

export interface PortfolioHolding {
    ticker: string;
    name: string;
    price: number;
    change: number;
    weight: number;
    color: string;
}

interface PortfolioContextType {
    portfolioHoldings: PortfolioHolding[];
    loading: boolean;
    addHolding: (ticker: string, name: string, price?: number) => Promise<void>;
    removeHolding: (ticker: string) => Promise<void>;
    updateWeight: (ticker: string, weight: number) => Promise<void>;
    applyModelPortfolio: (holdings: PortfolioHolding[]) => Promise<void>;
    refreshPrices: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType>({
    portfolioHoldings: [],
    loading: true,
    addHolding: async () => { },
    removeHolding: async () => { },
    updateWeight: async () => { },
    applyModelPortfolio: async () => { },
    refreshPrices: async () => { },
});

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshPrices = async () => {
        if (portfolioHoldings.length === 0) return;

        try {
            const tickers = portfolioHoldings.map(h => h.ticker).join(',');
            const res = await fetch(`/api/prices?tickers=${tickers}`);
            const updatedPrices = await res.json();

            if (Array.isArray(updatedPrices)) {
                setPortfolioHoldings(prev => {
                    const newHoldings = prev.map(holding => {
                        const update = updatedPrices.find(p => p.ticker === holding.ticker);
                        if (update && update.price) {
                            return {
                                ...holding,
                                price: update.price,
                                change: update.change || holding.change
                            };
                        }
                        return holding;
                    });
                    return newHoldings;
                });
            }
        } catch (error) {
            console.error("Error refreshing portfolio prices:", error);
        }
    };

    useEffect(() => {
        if (!user) {
            const localPortfolio = localStorage.getItem('financeai_portfolio');
            if (localPortfolio) {
                try {
                    setPortfolioHoldings(JSON.parse(localPortfolio));
                } catch (e) {
                    console.error("Error parsing local portfolio:", e);
                    setPortfolioHoldings([]);
                }
            } else {
                setPortfolioHoldings([]);
            }
            setLoading(false);
            return;
        }

        let unsubscribe: () => void = () => { };

        user.getIdToken(true).then(() => {
            const portfolioRef = collection(db, 'users', user.uid, 'portfolio');
            unsubscribe = onSnapshot(portfolioRef, (snapshot) => {
                const holdings: PortfolioHolding[] = [];
                snapshot.forEach((doc) => {
                    holdings.push(doc.data() as PortfolioHolding);
                });
                holdings.sort((a, b) => b.weight - a.weight);
                setPortfolioHoldings(holdings);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching portfolio:", error);
                setLoading(false);
            });
        }).catch((error) => {
            console.error("Error refreshing auth token:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Initial price refresh on load
    useEffect(() => {
        if (portfolioHoldings.length > 0 && !loading) {
            const timer = setTimeout(() => {
                refreshPrices();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    // Periodically refresh prices every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshPrices();
        }, 60000);
        return () => clearInterval(interval);
    }, [portfolioHoldings.length]);

    useEffect(() => {
        if (!user && !loading) {
            localStorage.setItem('financeai_portfolio', JSON.stringify(portfolioHoldings));
        }
    }, [portfolioHoldings, user, loading]);

    const addHolding = async (ticker: string, name: string, price?: number) => {
        if (portfolioHoldings.some((h) => h.ticker === ticker)) return;

        let currentPrice = price || 150.00;
        let currentChange = 0.5;

        // Try to fetch real-time price first
        try {
            const res = await fetch(`/api/prices?tickers=${ticker}`);
            const data = await res.json();
            if (data && data[0] && !data[0].error) {
                currentPrice = data[0].price || currentPrice;
                currentChange = data[0].change || currentChange;
            }
        } catch (e) {
            console.error("Error fetching initial price for holding:", e);
        }

        const newHolding: PortfolioHolding = {
            ticker,
            name,
            price: currentPrice,
            change: currentChange,
            weight: 0,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };

        if (!user) {
            setPortfolioHoldings(prev => {
                const newHoldings = [...prev, newHolding];
                newHoldings.sort((a, b) => b.weight - a.weight);
                return newHoldings;
            });
            return;
        }

        const holdingRef = doc(db, 'users', user.uid, 'portfolio', ticker);
        await setDoc(holdingRef, newHolding);
    };

    const removeHolding = async (ticker: string) => {
        if (!user) {
            setPortfolioHoldings(prev => prev.filter(h => h.ticker !== ticker));
            return;
        }
        const holdingRef = doc(db, 'users', user.uid, 'portfolio', ticker);
        await deleteDoc(holdingRef);
    };

    const updateWeight = async (ticker: string, weight: number) => {
        if (!user) {
            setPortfolioHoldings(prev => {
                const newHoldings = prev.map(h => h.ticker === ticker ? { ...h, weight } : h);
                newHoldings.sort((a, b) => b.weight - a.weight);
                return newHoldings;
            });
            return;
        }
        const holdingRef = doc(db, 'users', user.uid, 'portfolio', ticker);
        await setDoc(holdingRef, { weight }, { merge: true });
    };

    const applyModelPortfolio = async (holdings: PortfolioHolding[]) => {
        if (!user) {
            setPortfolioHoldings(holdings);
            return;
        }

        for (const holding of portfolioHoldings) {
            const holdingRef = doc(db, 'users', user.uid, 'portfolio', holding.ticker);
            await deleteDoc(holdingRef);
        }

        for (const holding of holdings) {
            const holdingRef = doc(db, 'users', user.uid, 'portfolio', holding.ticker);
            await setDoc(holdingRef, { ...holding, weight: holding.weight }); // Ensure structure
        }
    };

    return (
        <PortfolioContext.Provider value={{ portfolioHoldings, loading, addHolding, removeHolding, updateWeight, applyModelPortfolio, refreshPrices }}>
            {children}
        </PortfolioContext.Provider>
    );
};

