"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ProductVisual } from "./ProductVisual";
import type { VisualKind } from "@/lib/products";

/**
 * Shares the selected card colourway between the product page's big preview
 * and the configurator's colour picker, so switching black/white updates the
 * main image live (not just the picker swatch).
 */
interface ProductColorValue {
  color?: string;
  setColor: (id: string) => void;
}

const ProductColorContext = createContext<ProductColorValue>({
  setColor: () => {},
});

export function ProductColorProvider({
  defaultColor,
  children,
}: {
  defaultColor?: string;
  children: ReactNode;
}) {
  const [color, setColor] = useState<string | undefined>(defaultColor);
  return (
    <ProductColorContext.Provider value={{ color, setColor }}>
      {children}
    </ProductColorContext.Provider>
  );
}

export function useProductColor() {
  return useContext(ProductColorContext);
}

/** The product-page hero image, tinted to the currently selected colourway. */
export function HeroVisual({
  visual,
  name,
  fallbackColor,
  className,
}: {
  visual: VisualKind;
  name: string;
  fallbackColor?: string;
  className?: string;
}) {
  const { color } = useProductColor();
  return (
    <ProductVisual
      visual={visual}
      name={name}
      color={color ?? fallbackColor}
      featured
      className={className}
    />
  );
}
