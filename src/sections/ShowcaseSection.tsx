'use client';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TitleHeader from "../components/TitleHeader";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: "M.AI",
    type: "Startup",
    description: "AI-powered platform to reimagine short-form videos with RAG and LLM-driven script generation.",
    tags: ["React", "Next.js", "RAG", "LLM"],
    link: "https://github.com/grassheadd",
  },
  {
    title: "EasyWeds",
    type: "Desktop App",
    description: "Wedding planning app centralizing vendor/client data with custom data model and tagging system.",
    tags: ["Java", "JUnit5", "Gradle", "CI/CD"],
    link: "https://github.com/grassheadd",
  },
  {
    title: "Sentiment LLM",
    type: "ML Project",
    description: "Fine-tuned Llama-3.2-1B with LoRA, doubling prediction accuracy from 40% to 82%.",
    tags: ["PyTorch", "LoRA", "Unsloth", "HuggingFace"],
    link: "https://github.com/grassheadd",
  },
];

const ShowcaseSection = () => {
  useGSAP(() => {
    gsap.fromTo(
      ".project-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#work",
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section id="work" className="section-padding">
      <div className="w-full md:px-20 px-5">
        <TitleHeader
          title="Featured Projects"
          sub="🚀 What I've Built"
        />

        <div className="grid md:grid-cols-3 gap-5 mt-16">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card card-border rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#8BA989] transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-sm text-white-50">{project.type}</span>
                </div>
                <span className="text-white-50 group-hover:text-[#8BA989] group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>

              {/* Description */}
              <p className="text-white-50 mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-black-200 rounded-full text-white-50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
