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
}

const PortfolioContext = createContext<PortfolioContextType>({
    portfolioHoldings: [],
    loading: true,
    addHolding: async () => { },
    removeHolding: async () => { },
    updateWeight: async () => { },
    applyModelPortfolio: async () => { },
});

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
    const [loading, setLoading] = useState(true);

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

        // Force-refresh the auth token so Firestore recognizes the credential
        // before we attach the onSnapshot listener (avoids a race condition
        // on first login where the token hasn't propagated yet).
        let unsubscribe: () => void = () => { };

        user.getIdToken(true).then(() => {
            const portfolioRef = collection(db, 'users', user.uid, 'portfolio');
            unsubscribe = onSnapshot(portfolioRef, (snapshot) => {
                const holdings: PortfolioHolding[] = [];
                snapshot.forEach((doc) => {
                    holdings.push(doc.data() as PortfolioHolding);
                });
                // Sort by weight descending
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

    // Save to local storage whenever holdings change if not logged in
    useEffect(() => {
        if (!user && !loading) {
            localStorage.setItem('financeai_portfolio', JSON.stringify(portfolioHoldings));
        }
    }, [portfolioHoldings, user, loading]);

    const addHolding = async (ticker: string, name: string, price?: number) => {
        if (portfolioHoldings.some((h) => h.ticker === ticker)) return;

        const newHolding: PortfolioHolding = {
            ticker,
            name,
            price: price || 150.00, // Use dynamic price
            change: 0.5,
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

        // Clear existing portfolio first
        for (const holding of portfolioHoldings) {
            const holdingRef = doc(db, 'users', user.uid, 'portfolio', holding.ticker);
            await deleteDoc(holdingRef);
        }

        // Add new holdings
        for (const holding of holdings) {
            const holdingRef = doc(db, 'users', user.uid, 'portfolio', holding.ticker);
            await setDoc(holdingRef, holding);
        }
    };

    return (
        <PortfolioContext.Provider value={{ portfolioHoldings, loading, addHolding, removeHolding, updateWeight, applyModelPortfolio }}>
            {children}
        </PortfolioContext.Provider>
    );
};
