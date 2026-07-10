import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="rounded-2xl bg-orange-100 px-6 py-2 font-display text-6xl font-extrabold text-orange-600">
        404
      </p>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-stone-900">
        Page not found
      </h1>
      <p className="mt-3 text-stone-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/products" variant="secondary">
          Shop products
        </ButtonLink>
      </div>
    </section>
  );
}
