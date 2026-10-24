import ContactForm from "@/features/home/ContactForm";
import PhotoCarousel from "@/features/home/PhotoCarousel";
import Squiggle from "@/shared/components/Squiggle";
import Footer from "@/shared/components/Footer";
import { expCards } from "@/features/home/constants";

export default function Home() {
  return (
    <>

      <main className="w-full max-w-5xl mx-auto px-6 pt-36 md:pt-44 flex-1">
        {/* hero */}
        <section className="rise rise-1">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            hi, i&apos;m junjie <span className="text-forest">(jj)</span>
            <span className="text-forest">.</span>
          </h1>
          <Squiggle className="w-64 md:w-96 h-3 mt-2" />
          <div className="mt-8 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-4">
            <div className="notebook-page sketch-border-soft bg-paper px-7 py-7 pl-10 md:px-8 md:py-9 md:pl-11">
              <p className="hand text-sm text-forest mb-4">a little about me</p>
              <p className="text-lg md:text-xl">
                I build things that (hopefully) work, then keep tinkering until
                they feel right. I&apos;m at{" "}
                <strong className="text-forest underline decoration-wavy decoration-sage underline-offset-4">Tencent</strong> in
                Singapore now. Before that, I shipped AI products at{" "}
                <strong>Didero</strong> in NYC and worked on multilingual AI
                research at <strong>AI Singapore</strong>.
              </p>
              <p className="mt-4 text-ink-soft">
                This is my grasshut: a little patch of the internet for things
                I&apos;ve made, lessons I&apos;ve learned, and whatever grows next.
                Come on in.
              </p>
            </div>
            <PhotoCarousel />
          </div>
        </section>

        {/* experience */}
        <section className="rise rise-2 mt-20 md:mt-24">
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

        {/* say hi */}
        <section className="rise rise-3 mt-20 md:mt-24">
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
