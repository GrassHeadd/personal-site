import Link from "next/link";

import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import Squiggle from "@/components/Squiggle";
import Footer from "@/sections/Footer";
import { expCards } from "@/constants";

const projects = [
  {
    name: "braindump",
    blurb: "voice-first personal knowledge OS — my second brain, in progress",
    href: null,
    status: "digging the foundation",
  },
  {
    name: "talkerinos",
    blurb: "thoughts, rambles, and the occasional tutorial",
    href: "/talkerinos",
    status: null,
  },
  {
    name: "app hub",
    blurb: "small experiments and tools, in various states of done",
    href: "/projects",
    status: null,
  },
  {
    name: "qol+",
    blurb: "hand-drawn quality-of-life dashboard — calendar, lists, life admin",
    href: null,
    status: "growing quietly",
  },
];

const plots = [
  { emoji: "🌱", name: "notes garden", note: "public pieces of the braindump vault", href: null },
  { emoji: "📅", name: "calendar", note: "what i'm up to — just sprouted, take a look", href: "/calendar" },
  { emoji: "⚙️", name: "workflows", note: "little automations running my life", href: null },
  { emoji: "📷", name: "photo roll", note: "film & phone shots worth keeping", href: null },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-36 md:pt-44">
        {/* hero */}
        <section className="rise rise-1">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            hi, i&apos;m junjie <span className="text-forest">(jj)</span>
            <span className="text-forest">.</span>
          </h1>
          <Squiggle className="w-64 md:w-96 h-3 mt-2" />
          <p className="mt-8 text-lg md:text-xl max-w-xl">
            I build things that (hopefully) work — full stack and AI, currently
            at{" "}
            <a
              href="https://didero.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="ink-link"
            >
              Didero
            </a>{" "}
            in NYC.
          </p>
          <p className="mt-3 text-ink-soft max-w-xl">
            This is my grasshut: part portfolio, part notebook, eventually a
            whole brain. Poke around.
          </p>
        </section>

        {/* projects */}
        <section className="rise rise-2 mt-20 md:mt-24">
          <div className="section-head">
            <h2>growing here</h2>
          </div>
          <ul className="flex flex-col gap-1">
            {projects.map((p) => {
              const inner = (
                <div className="grid md:grid-cols-[9rem_1fr] gap-x-6 gap-y-0.5 items-baseline">
                  <span className="row-title text-lg">
                    {p.name}
                    {p.href && <span className="text-forest"> →</span>}
                  </span>
                  <span className="text-ink-soft">
                    {p.blurb}
                    {p.status && (
                      <span className="hand text-forest text-sm"> · {p.status}</span>
                    )}
                  </span>
                </div>
              );
              return (
                <li key={p.name}>
                  {p.href ? (
                    <Link href={p.href} className="row-link">
                      {inner}
                    </Link>
                  ) : (
                    <div className="row-link cursor-default">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* experience */}
        <section className="rise rise-3 mt-20 md:mt-24">
          <div className="section-head">
            <h2>work so far</h2>
          </div>
          <ul className="flex flex-col">
            {expCards.map((job, i) => (
              <li
                key={job.company}
                className={`py-6 ${i > 0 ? "border-t border-dashed border-pencil" : "pt-0"}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 mb-1.5">
                  <h3 className="text-lg font-bold">{job.company}</h3>
                  <span className="text-ink-soft text-sm">{job.title}</span>
                  <span className="hand text-forest text-sm ml-auto">{job.date}</span>
                </div>
                {job.responsibilities.map((line) => (
                  <p key={line} className="text-ink-soft text-[0.95rem]">
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>

        {/* coming soon plots */}
        <section className="rise rise-4 mt-20 md:mt-24">
          <div className="section-head">
            <h2>on the way</h2>
          </div>
          <p className="text-ink-soft text-sm -mt-4 mb-6">
            plots i&apos;ve marked out but haven&apos;t planted yet.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plots.map((plot) => {
              const inner = (
                <>
                  <p className="hand font-bold">
                    <span aria-hidden="true">{plot.emoji}</span> {plot.name}
                    {plot.href && <span className="text-forest"> →</span>}
                  </p>
                  <p className="text-ink-soft text-sm mt-1">{plot.note}</p>
                </>
              );
              return plot.href ? (
                <Link
                  key={plot.name}
                  href={plot.href}
                  className="sketch-border-soft p-5 hover:border-forest hover:-rotate-[0.5deg] transition-all duration-200"
                >
                  {inner}
                </Link>
              ) : (
                <div key={plot.name} className="sketch-dashed p-5">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* say hi */}
        <section className="rise rise-5 mt-20 md:mt-24">
          <div className="sketch-border p-6 md:p-8 -rotate-[0.4deg]">
            <h2 className="text-xl md:text-2xl font-bold">
              say hi<span className="text-forest">.</span>
            </h2>
            <p className="text-ink-soft mt-2">
              Find me on{" "}
              <a
                href="https://github.com/grassheadd"
                target="_blank"
                rel="noopener noreferrer"
                className="ink-link"
              >
                github
              </a>{" "}
              or{" "}
              <a
                href="https://linkedin.com/in/junjiehu1"
                target="_blank"
                rel="noopener noreferrer"
                className="ink-link"
              >
                linkedin
              </a>
              , or drop a note straight into my inbox. I read everything,
              eventually.
            </p>
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
