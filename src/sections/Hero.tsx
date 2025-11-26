'use client';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import Button from "../components/Button";
import HeroExperience from "../components/models/hero_models/HeroExperience";

const Hero = () => {
  useGSAP(() => {
    gsap.fromTo(
      ".hero-text h1",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: "power2.inOut" }
    );
  });

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-0 left-0 z-10">
        <img src="/images/bg.png" alt="" />
      </div>

      <div className="hero-layout">
        <header className="flex flex-col justify-center md:w-full w-screen px-5 md:pl-[10%]">
          <div className="flex flex-col gap-5">
            <div className="hero-text">
              <h1>Welcome to</h1>
              <h1 className="text-[#3b82f6]">the Grasshut</h1>
            </div>

            <p className="text-white-50 md:text-xl relative z-10 pointer-events-none max-w-lg">
              I&apos;m JJ — a Full Stack Developer and AI tinkerer who builds things that (hopefully) work.
            </p>

            <p className="text-white-50 text-sm md:text-base relative z-10 pointer-events-none max-w-md opacity-70">
              This is my corner of the internet. Poke around for projects, experiments, and the occasional ramble.
            </p>

            <Button
              text="See My Work"
              className="md:w-80 md:h-16 w-60 h-12"
              id="work"
            />
          </div>
        </header>

        {/* RIGHT: 3D Model or Visual */}
        <figure className="pointer-events-none">
          <div className="hero-3d-layout">
            <HeroExperience />
          </div>
        </figure>
      </div>

    </section>
  );
};

export default Hero;
