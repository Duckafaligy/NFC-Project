import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="box inline-block bg-bubble px-6 py-2 font-display text-6xl text-ink">
        404
      </p>
      <h1 className="mt-6 font-display text-2xl uppercase text-ink">
        Page not found
      </h1>
      <p className="mt-3 text-ink/60">
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
