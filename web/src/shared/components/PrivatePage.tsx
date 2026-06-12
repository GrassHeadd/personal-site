import Squiggle from "./Squiggle";
import Footer from "./Footer";

/* What strangers see in place of an admin-only page. */
export default function PrivatePage({ title }: { title: string }) {
  return (
    <>
      <main className="w-full max-w-2xl mx-auto px-6 pt-24 md:pt-28 flex-1">
        <h1 className="text-3xl md:text-5xl font-bold mb-1">
          {title}
          <span className="text-forest">.</span>
        </h1>
        <Squiggle className="w-40 md:w-56 h-3 mb-4" />
        <p className="hand text-ink-soft -rotate-[0.3deg]">
          this page only opens after whispering the magic word. 🤫
        </p>
      </main>
      <Footer />
    </>
  );
}
