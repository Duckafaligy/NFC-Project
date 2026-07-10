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
      note: noteParts.join(" — ") || undefined,
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-sm text-slate-500">Price</span>
          <p className="font-display text-3xl font-bold text-slate-900">
            {formatPrice(unitPrice)}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-paper px-3 py-1 text-xs text-slate-600">
          {product.formFactor}
        </span>
      </div>

      {/* Design type choice */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-900">
          Choose your design
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => setDesignType("standard")}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              designType === "standard"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <Sparkles className="h-5 w-5 text-blue-600" />
            <p className="mt-2 font-semibold text-slate-900">Standard</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Clean, ready-made design
            </p>
          </button>
          <button
            onClick={() => setDesignType("custom")}
            className={cn(
              "relative rounded-xl border p-4 text-left transition-all",
              designType === "custom"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <PenTool className="h-5 w-5 text-blue-600" />
            <p className="mt-2 font-semibold text-slate-900">Custom</p>
            <p className="mt-0.5 text-xs text-slate-500">
              +{formatPrice(product.customUpcharge)} · your brand
            </p>
          </button>
        </div>
      </div>

      {/* Custom sub-options */}
      {designType === "custom" && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-paper p-4">
          <p className="text-sm font-semibold text-slate-900">
            How should we handle the design?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setCustomMethod("upload")}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                customMethod === "upload"
                  ? "border-blue-600 bg-white"
                  : "border-slate-200 bg-white/60 hover:border-slate-300",
              )}
            >
              <Upload className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Upload my design
                </p>
                <p className="text-xs text-slate-500">
                  I have artwork ready to go
                </p>
              </div>
            </button>
            <button
              onClick={() => setCustomMethod("we-design")}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                customMethod === "we-design"
                  ? "border-blue-600 bg-white"
                  : "border-slate-200 bg-white/60 hover:border-slate-300",
              )}
            >
              <PenTool className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Design it for me
                </p>
                <p className="text-xs text-slate-500">
                  Our team creates it on-brand
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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-600 transition-colors hover:border-blue-500 hover:text-slate-900"
              >
                {fileName ? (
                  <>
                    <FileCheck2 className="h-4 w-4 text-emerald-600" />
                    {fileName}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose file (PNG, PDF, AI, SVG…)
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-slate-400">
                We&apos;ll confirm your artwork by email before printing.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-700">
              {customMethod === "we-design"
                ? "Tell us about your brand & what you want"
                : "Notes for our team (optional)"}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={
                customMethod === "we-design"
                  ? "Business name, colors, vibe, link the card should point to…"
                  : "Anything we should know…"
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Quantity + pack pricing */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">
            How many?
          </span>
          <div className="flex items-center gap-3 rounded-full border border-slate-300 bg-white p-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-semibold text-slate-900">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
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
                "relative rounded-lg border px-2 py-2.5 text-center transition-all",
                qty === pack.qty
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <span className="block text-xs font-semibold text-slate-900">
                {pack.label}
              </span>
              {pack.badge && (
                <span className="mt-0.5 block text-[10px] font-bold text-emerald-600">
                  {pack.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Most shops grab 3 — counter, door, and a spare.
        </p>
      </div>

      {/* Total + actions */}
      <div className="mt-6 space-y-1.5 border-t border-slate-200 pt-4">
        {tierDiscount(qty) > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {formatPrice(unitPriceFor(unitPrice, qty))} each × {qty}
            </span>
            <span className="font-semibold text-emerald-600">
              You save {formatPrice(unitPrice * qty - lineTotal(unitPrice, qty))}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Subtotal</span>
          <span className="font-display text-xl font-bold text-slate-900">
            {tierDiscount(qty) > 0 && (
              <span className="mr-2 text-sm font-normal text-slate-400 line-through">
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
              <Check className="h-5 w-5 text-emerald-600" /> Added to cart
            </>
          ) : (
            "Add to cart"
          )}
        </Button>
      </div>

      {/* Trust row */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4 text-center">
        <div>
          <ShieldCheck className="mx-auto h-4 w-4 text-emerald-600" />
          <p className="mt-1 text-[11px] leading-tight text-slate-500">
            {site.guaranteeDays}-day money back
          </p>
        </div>
        <div>
          <Truck className="mx-auto h-4 w-4 text-blue-600" />
          <p className="mt-1 text-[11px] leading-tight text-slate-500">
            Ships in {site.shipping.handlingDays}
          </p>
        </div>
        <div>
          <RefreshCw className="mx-auto h-4 w-4 text-slate-500" />
          <p className="mt-1 text-[11px] leading-tight text-slate-500">
            Free replacement if it stops scanning
          </p>
        </div>
      </div>
    </div>
  );
}
