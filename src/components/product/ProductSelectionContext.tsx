"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ProductSelectionContextType {
    selectedColor: string;
    setSelectedColor: (color: string) => void;
    selectedSize: string;
    setSelectedSize: (size: string) => void;
}

const ProductSelectionContext = createContext<ProductSelectionContextType | undefined>(undefined);

export const ProductSelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");

    return (
        <ProductSelectionContext.Provider value={{ selectedColor, setSelectedColor, selectedSize, setSelectedSize }}>
            {children}
        </ProductSelectionContext.Provider>
    );
};

export const useProductSelection = () => {
    const context = useContext(ProductSelectionContext);
    if (!context) {
        throw new Error("useProductSelection must be used within a ProductSelectionProvider");
    }
    return context;
};
