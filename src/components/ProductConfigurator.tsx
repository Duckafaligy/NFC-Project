"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  CalendarCheck,
  Clock,
} from "lucide-react";
import {
  configuredUnitPrice,
  DESIGN_LABOUR_FEE,
  type Product,
} from "@/lib/products";
import {
  useCart,
  type CustomMethod,
  type DesignType,
} from "@/context/CartContext";
import { formatPrice, cn } from "@/lib/utils";
import {
  unitPriceFor,
  lineTotal,
  compareLineTotal,
  discountRate,
} from "@/lib/pricing";
import { useStoreStatus } from "@/context/StoreStatus";
import { site } from "@/lib/site";
import { Button } from "./Button";
import { StockBar } from "./StockBar";
import { ProductVisual } from "./ProductVisual";
import { useProductColor } from "./ProductColor";

const inputFocus =
  "focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200";

export function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [designType, setDesignType] = useState<DesignType>("standard");
  const [customMethod, setCustomMethod] = useState<CustomMethod>("we-design");
  const [fileName, setFileName] = useState<string>("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  // Colour is shared with the product-page hero so picking black/white
  // updates the big preview live (see ProductColorProvider).
  const { color: ctxColor, setColor } = useProductColor();
  const color = ctxColor ?? product.colors?.[0]?.id;
  const selectedColorLabel = product.colors?.find((c) => c.id === color)?.label;

  // Estimated delivery window, computed client-side after mount so the
  // prerendered HTML never disagrees with the browser's date.
  const [eta, setEta] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    });
    const start = new Date();
    start.setDate(start.getDate() + 4);
    const end = new Date();
    end.setDate(end.getDate() + 9);
    setEta(`${fmt.format(start)} - ${fmt.format(end)}`);
  }, []);

  const status = useStoreStatus();
  const preorder = status.preorder;
  // One shared pool: every product is the same physical card.
  const liveStock = status.cardStock;
  const outOfStock = liveStock <= 0;

  // Effective prices honour the owner's live overrides from /admin-dashboard.
  // status.prices already holds the merged effective value (customUpcharge may
  // be null, meaning the product isn't customizable).
  const priced = status.prices[product.id];
  const basePrice = priced?.basePrice ?? product.basePrice;
  const customUpcharge = priced ? priced.customUpcharge : product.customUpcharge;
  const customizable = customUpcharge != null;
  // If the product isn't customizable, everything runs as a standard order.
  const activeDesign: DesignType = customizable ? designType : "standard";

  const unitPrice = useMemo(
    () =>
      configuredUnitPrice(
        { ...product, basePrice, customUpcharge },
        activeDesign,
        customMethod,
      ),
    [product, basePrice, customUpcharge, activeDesign, customMethod],
  );
  const payNow = unitPriceFor(unitPrice, preorder);

  function handleAdd(goToCheckout: boolean) {
    const noteParts: string[] = [];
    if (activeDesign === "custom") {
      if (customMethod === "upload" && fileName)
        noteParts.push(`Uploaded artwork: ${fileName}`);
      if (customMethod === "we-design") noteParts.push("Wants us to design it");
    }
    if (note.trim()) noteParts.push(note.trim());

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      designType: activeDesign,
      customMethod: activeDesign === "custom" ? customMethod : undefined,
      color: product.colors ? color : undefined,
      note: noteParts.join(" / ") || undefined,
      unitPrice,
      quantity: qty,
    });

    if (goToCheckout) {
      router.push("/checkout");
    } else {
      openDrawer();
    }
  }

  return (
    <div className="card p-6">
      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-sm text-neutral-400">Price</span>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-3xl font-extrabold text-neutral-900">
              {formatPrice(payNow)}
            </p>
            {preorder && (
              <p className="text-lg font-semibold text-neutral-400 line-through">
                {formatPrice(unitPrice)}
              </p>
            )}
          </div>
          {preorder && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-violet-600 px-2 py-0.5 text-[11px] font-bold text-white">
              <Clock className="h-3 w-3" />
              {site.preorder.label}: {Math.round(discountRate(true) * 100)}% off
              your whole cart
            </span>
          )}
        </div>
        <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
          {product.formFactor}
        </span>
      </div>

      {/* Availability */}
      <StockBar stock={liveStock} />

      {/* Card colour (only for products with colourways, e.g. Google) */}
      {product.colors && product.colors.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-bold text-neutral-900">
            Card colour
            {selectedColorLabel ? (
              <span className="font-normal text-neutral-500"> · {selectedColorLabel}</span>
            ) : null}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {product.colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                aria-pressed={color === c.id}
                className={cn(
                  "overflow-hidden rounded-md border-2 p-2 transition-all",
                  color === c.id
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 bg-white hover:border-neutral-400",
                )}
              >
                <ProductVisual
                  visual={product.visual}
                  name={`${product.name} ${c.label}`}
                  color={c.id}
                  className="aspect-[4/3] rounded-sm"
                />
                <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-900">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-neutral-300"
                    style={{ background: c.swatch }}
                  />
                  {c.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Design type choice (only when the product is customizable) */}
      {customizable && (
      <div className="mt-6">
        <p className="text-sm font-bold text-neutral-900">Choose your design</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => setDesignType("standard")}
            className={cn(
              "rounded-md border-2 p-4 text-left transition-all",
              designType === "standard"
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 bg-white hover:border-neutral-400",
            )}
          >
            <Sparkles className="h-5 w-5 text-neutral-900" />
            <p className="mt-2 font-bold text-neutral-900">Standard</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Clean, ready-made design · {formatPrice(basePrice)}
            </p>
          </button>
          <button
            onClick={() => setDesignType("custom")}
            className={cn(
              "rounded-md border-2 p-4 text-left transition-all",
              designType === "custom"
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 bg-white hover:border-neutral-400",
            )}
          >
            <PenTool className="h-5 w-5 text-neutral-900" />
            <p className="mt-2 font-bold text-neutral-900">Custom</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Your brand · from {formatPrice(basePrice + (customUpcharge ?? 0))}
            </p>
          </button>
        </div>
      </div>
      )}

      {/* Custom sub-options */}
      {customizable && designType === "custom" && (
        <div className="mt-4 space-y-4 rounded-md bg-neutral-50 p-4">
          <p className="text-sm font-bold text-neutral-900">
            How should we handle the design?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setCustomMethod("upload")}
              className={cn(
                "flex items-start gap-3 rounded-md border-2 p-3 text-left transition-all",
                customMethod === "upload"
                  ? "border-neutral-900 bg-white"
                  : "border-neutral-200 bg-white/70 hover:border-neutral-400",
              )}
            >
              <Upload className="mt-0.5 h-5 w-5 text-neutral-900" />
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  Upload my design
                </p>
                <p className="text-xs text-neutral-500">
                  I have artwork ready · no extra fee
                </p>
              </div>
            </button>
            <button
              onClick={() => setCustomMethod("we-design")}
              className={cn(
                "flex items-start gap-3 rounded-md border-2 p-3 text-left transition-all",
                customMethod === "we-design"
                  ? "border-neutral-900 bg-white"
                  : "border-neutral-200 bg-white/70 hover:border-neutral-400",
              )}
            >
              <PenTool className="mt-0.5 h-5 w-5 text-neutral-900" />
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  Design it for me
                </p>
                <p className="text-xs text-neutral-500">
                  We design it around your brand · +
                  {formatPrice(DESIGN_LABOUR_FEE)} design fee
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
                className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 bg-white px-4 py-4 text-sm font-semibold text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
              >
                {fileName ? (
                  <>
                    <FileCheck2 className="h-4 w-4 text-neutral-900" />
                    {fileName}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose file (PNG, PDF, AI, SVG)
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-neutral-400">
                We confirm your artwork by email before printing.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-neutral-700">
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
              className={`mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 ${inputFocus}`}
            />
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-neutral-900">How many?</span>
          <p className="text-xs text-neutral-400">
            Counter, door, and a spare is a common setup.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-bold text-neutral-900">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Total + actions */}
      <div className="mt-6 space-y-1.5 border-t border-neutral-200 pt-4">
        {preorder && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">
              {formatPrice(payNow)} each × {qty}
            </span>
            <span className="font-bold text-emerald-600">
              You save{" "}
              {formatPrice(
                compareLineTotal(unitPrice, qty) - lineTotal(unitPrice, qty, preorder),
              )}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Subtotal</span>
          <span className="font-display text-xl font-extrabold text-neutral-900">
            {preorder && (
              <span className="mr-2 text-sm font-normal text-neutral-400 line-through">
                {formatPrice(compareLineTotal(unitPrice, qty))}
              </span>
            )}
            {formatPrice(lineTotal(unitPrice, qty, preorder))}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Button onClick={() => handleAdd(true)} size="lg" disabled={outOfStock}>
          <ShoppingBag className="h-5 w-5" />
          {outOfStock
            ? "Out of stock"
            : preorder
              ? "Pre-order now"
              : "Buy now"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleAdd(false)}
          disabled={outOfStock}
        >
          {outOfStock ? "Back soon" : "Add to cart"}
        </Button>
      </div>

      {/* Fulfilment note */}
      {preorder ? (
        <p className="mt-4 flex items-center justify-center gap-1.5 rounded-md bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
          <Clock className="h-4 w-4" />
          {site.preorder.shipNote}
        </p>
      ) : designType === "standard" && eta ? (
        <p className="mt-4 flex items-center justify-center gap-1.5 rounded-md bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
          <CalendarCheck className="h-4 w-4" />
          Order today, estimated arrival {eta}
        </p>
      ) : designType === "custom" ? (
        <p className="mt-4 flex items-center justify-center gap-1.5 rounded-md bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
          <Check className="h-4 w-4" />
          Design proof by email within 48 hours, printed after your approval
        </p>
      ) : null}

      {/* Trust row */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-neutral-200 pt-4 text-center">
        <div>
          <ShieldCheck className="mx-auto h-4 w-4 text-emerald-600" />
          <p className="mt-1 text-[11px] leading-tight text-neutral-500">
            {site.guaranteeDays}-day free maintenance
          </p>
        </div>
        <div>
          <Truck className="mx-auto h-4 w-4 text-blue-600" />
          <p className="mt-1 text-[11px] leading-tight text-neutral-500">
            Flat-rate North America shipping
          </p>
        </div>
        <div>
          <RefreshCw className="mx-auto h-4 w-4 text-neutral-900" />
          <p className="mt-1 text-[11px] leading-tight text-neutral-500">
            Free replacement if it stops scanning
          </p>
        </div>
      </div>
    </div>
  );
}
