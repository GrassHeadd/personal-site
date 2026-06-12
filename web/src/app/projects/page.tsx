import Link from "next/link";
import Footer from "@/shared/components/Footer";

export default function Projects() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-xl">
          <div className="sketch-dashed inline-block py-2 px-5 mb-8 -rotate-2 text-sm font-semibold uppercase tracking-widest text-ink-soft">
            🚧 work in progress
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            app hub<span className="text-forest">.</span>
          </h1>

          <p className="text-ink-soft text-lg mb-10">
            Something&apos;s cooking. Check back soon.
          </p>

          <Link
            href="/"
            className="text-forest underline decoration-wavy decoration-sage underline-offset-4 hover:decoration-forest"
          >
            ← back to the hut
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
