"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Minus,
  Plus,
  Upload,
  PenTool,
  Sparkles,
  ShoppingBag,
  FileCheck2,
  ShieldCheck,
  Truck,
  RefreshCw,
} from "lucide-react";
import type { Product } from "@/lib/products";
import {
  useCart,
  type CustomMethod,
  type DesignType,
} from "@/context/CartContext";
import { formatPrice, cn } from "@/lib/utils";
import { unitPriceFor, lineTotal, tierDiscount } from "@/lib/pricing";
import { site } from "@/lib/site";
import { Button } from "./Button";

export function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [designType, setDesignType] = useState<DesignType>("standard");
  const [customMethod, setCustomMethod] = useState<CustomMethod>("we-design");
  const [fileName, setFileName] = useState<string>("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const unitPrice = useMemo(
    () =>
      designType === "custom"
        ? product.basePrice + product.customUpcharge
        : product.basePrice,
    [designType, product.basePrice, product.customUpcharge],
  );

  function handleAdd(goToCheckout: boolean) {
    const noteParts: string[] = [];
    if (designType === "custom") {
      if (customMethod === "upload" && fileName)
        noteParts.push(`Uploaded artwork: ${fileName}`);
      if (customMethod === "we-design") noteParts.push("Wants us to design it");
    }
    if (note.trim()) noteParts.push(note.trim());

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      designType,
      customMethod: designType === "custom" ? customMethod : undefined,
      note: noteParts.join(" / ") || undefined,
      unitPrice,
      quantity: qty,
    });

    if (goToCheckout) {
      router.push("/checkout");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  return (
    <div className="box p-6">
      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <span className="tag text-ink/50">Price</span>
          <p className="font-display text-3xl text-ink">
            {formatPrice(unitPrice)}
          </p>
        </div>
        <span className="border-2 border-ink bg-cream px-3 py-1 font-mono text-xs font-bold uppercase text-ink">
          {product.formFactor}
        </span>
      </div>

      {/* Design type choice */}
      <div className="mt-6">
        <p className="tag text-ink">Choose your design</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => setDesignType("standard")}
            className={cn(
              "border-2 border-ink p-4 text-left transition-all",
              designType === "standard"
                ? "bg-yolk shadow-brutal"
                : "bg-white hover:bg-cream",
            )}
          >
            <Sparkles className="h-5 w-5 text-ink" />
            <p className="mt-2 font-bold uppercase text-ink">Standard</p>
            <p className="mt-0.5 text-xs text-ink/70">
              Clean, ready-made design
            </p>
          </button>
          <button
            onClick={() => setDesignType("custom")}
            className={cn(
              "border-2 border-ink p-4 text-left transition-all",
              designType === "custom"
                ? "bg-yolk shadow-brutal"
                : "bg-white hover:bg-cream",
            )}
          >
            <PenTool className="h-5 w-5 text-ink" />
            <p className="mt-2 font-bold uppercase text-ink">Custom</p>
            <p className="mt-0.5 text-xs text-ink/70">
              +{formatPrice(product.customUpcharge)} · your brand
            </p>
          </button>
        </div>
      </div>

      {/* Custom sub-options */}
      {designType === "custom" && (
        <div className="mt-4 space-y-4 border-2 border-ink bg-cream p-4">
          <p className="tag text-ink">How should we handle the design?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setCustomMethod("upload")}
              className={cn(
                "flex items-start gap-3 border-2 border-ink p-3 text-left transition-all",
                customMethod === "upload"
                  ? "bg-bubble shadow-brutal-sm"
                  : "bg-white",
              )}
            >
              <Upload className="mt-0.5 h-5 w-5 text-ink" />
              <div>
                <p className="text-sm font-bold text-ink">Upload my design</p>
                <p className="text-xs text-ink/70">
                  I have artwork ready to go
                </p>
              </div>
            </button>
            <button
              onClick={() => setCustomMethod("we-design")}
              className={cn(
                "flex items-start gap-3 border-2 border-ink p-3 text-left transition-all",
                customMethod === "we-design"
                  ? "bg-bubble shadow-brutal-sm"
                  : "bg-white",
              )}
            >
              <PenTool className="mt-0.5 h-5 w-5 text-ink" />
              <div>
                <p className="text-sm font-bold text-ink">Design it for me</p>
                <p className="text-xs text-ink/70">
                  We design it around your brand
                </p>
              </div>
            </button>
          </div>

          {customMethod === "upload" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.ai,.eps,.svg"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-ink bg-white px-4 py-4 text-sm font-bold text-ink transition-colors hover:bg-yolk/30"
              >
                {fileName ? (
                  <>
                    <FileCheck2 className="h-4 w-4 text-ink" />
                    {fileName}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose file (PNG, PDF, AI, SVG)
                  </>
                )}
              </button>
              <p className="mt-2 font-mono text-xs text-ink/60">
                We confirm your artwork by email before printing.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-ink">
              {customMethod === "we-design"
                ? "Tell us about your brand and what you want"
                : "Notes for our team (optional)"}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={
                customMethod === "we-design"
                  ? "Business name, colors, the link the card should open..."
                  : "Anything we should know..."
              }
              className="mt-2 w-full border-2 border-ink bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:bg-yolk/10 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Quantity + pack pricing */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="tag text-ink">How many?</span>
          <div className="flex items-center border-2 border-ink bg-white">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center border-r-2 border-ink text-ink hover:bg-cream"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-mono font-bold text-ink">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center border-l-2 border-ink text-ink hover:bg-cream"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { qty: 1, label: "Single", badge: null },
            { qty: 3, label: "3-pack", badge: "-10%" },
            { qty: 5, label: "5-pack", badge: "-15%" },
            { qty: 10, label: "10-pack", badge: "-20%" },
          ].map((pack) => (
            <button
              key={pack.qty}
              onClick={() => setQty(pack.qty)}
              className={cn(
                "border-2 border-ink px-2 py-2.5 text-center transition-all",
                qty === pack.qty ? "bg-mint shadow-brutal-sm" : "bg-white hover:bg-cream",
              )}
            >
              <span className="block text-xs font-bold uppercase text-ink">
                {pack.label}
              </span>
              {pack.badge && (
                <span className="mt-0.5 block font-mono text-[10px] font-bold text-ink">
                  {pack.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-xs text-ink/50">
          Most shops take 3: counter, door, spare.
        </p>
      </div>

      {/* Total + actions */}
      <div className="mt-6 space-y-1.5 border-t-2 border-ink pt-4">
        {tierDiscount(qty) > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono text-ink/60">
              {formatPrice(unitPriceFor(unitPrice, qty))} each × {qty}
            </span>
            <span className="border-2 border-ink bg-mint px-2 py-0.5 font-mono text-xs font-bold text-ink">
              SAVE {formatPrice(unitPrice * qty - lineTotal(unitPrice, qty))}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="tag text-ink/60">Subtotal</span>
          <span className="font-display text-2xl text-ink">
            {tierDiscount(qty) > 0 && (
              <span className="mr-2 font-mono text-sm font-normal text-ink/40 line-through">
                {formatPrice(unitPrice * qty)}
              </span>
            )}
            {formatPrice(lineTotal(unitPrice, qty))}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Button onClick={() => handleAdd(true)} size="lg">
          <ShoppingBag className="h-5 w-5" /> Buy now
        </Button>
        <Button variant="secondary" onClick={() => handleAdd(false)}>
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added to cart
            </>
          ) : (
            "Add to cart"
          )}
        </Button>
      </div>

      {/* Trust row */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t-2 border-ink pt-4 text-center">
        <div>
          <ShieldCheck className="mx-auto h-4 w-4 text-ink" />
          <p className="mt-1 font-mono text-[10px] font-bold uppercase leading-tight text-ink/70">
            {site.guaranteeDays}-day money back
          </p>
        </div>
        <div>
          <Truck className="mx-auto h-4 w-4 text-ink" />
          <p className="mt-1 font-mono text-[10px] font-bold uppercase leading-tight text-ink/70">
            Ships in {site.shipping.handlingDays}
          </p>
        </div>
        <div>
          <RefreshCw className="mx-auto h-4 w-4 text-ink" />
          <p className="mt-1 font-mono text-[10px] font-bold uppercase leading-tight text-ink/70">
            Free replacement
          </p>
        </div>
      </div>
    </div>
  );
}
