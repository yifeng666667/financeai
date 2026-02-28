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
    addHolding: (ticker: string, name: string) => Promise<void>;
    removeHolding: (ticker: string) => Promise<void>;
    updateWeight: (ticker: string, weight: number) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType>({
    portfolioHoldings: [],
    loading: true,
    addHolding: async () => { },
    removeHolding: async () => { },
    updateWeight: async () => { },
});

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setPortfolioHoldings([]);
            setLoading(false);
            return;
        }

        const portfolioRef = collection(db, 'users', user.uid, 'portfolio');
        const unsubscribe = onSnapshot(portfolioRef, (snapshot) => {
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

        return () => unsubscribe();
    }, [user]);

    const addHolding = async (ticker: string, name: string) => {
        if (!user) return;
        if (portfolioHoldings.some((h) => h.ticker === ticker)) return;

        const newHolding: PortfolioHolding = {
            ticker,
            name,
            price: 150.00, // Default mock price
            change: 0.5,
            weight: 0,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };

        const holdingRef = doc(db, 'users', user.uid, 'portfolio', ticker);
        await setDoc(holdingRef, newHolding);
    };

    const removeHolding = async (ticker: string) => {
        if (!user) return;
        const holdingRef = doc(db, 'users', user.uid, 'portfolio', ticker);
        await deleteDoc(holdingRef);
    };

    const updateWeight = async (ticker: string, weight: number) => {
        if (!user) return;
        const holdingRef = doc(db, 'users', user.uid, 'portfolio', ticker);
        await setDoc(holdingRef, { weight }, { merge: true });
    };

    return (
        <PortfolioContext.Provider value={{ portfolioHoldings, loading, addHolding, removeHolding, updateWeight }}>
            {children}
        </PortfolioContext.Provider>
    );
};
