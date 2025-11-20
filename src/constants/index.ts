import { meta, shopify, starbucks, tesla } from "../assets/images";
import {
  car,
  contact,
  css,
  estate,
  express,
  git,
  github,
  html,
  javascript,
  linkedin,
  mongodb,
  motion,
  mui,
  nextjs,
  nodejs,
  pricewise,
  react,
  redux,
  sass,
  snapgram,
  summiz,
  tailwindcss,
  threads,
  typescript,
} from "../assets/icons";

export const skills = [
  {
    imageUrl: css,
    name: "CSS",
    type: "Frontend",
  },
  {
    imageUrl: express,
    name: "Express",
    type: "Backend",
  },
  {
    imageUrl: git,
    name: "Git",
    type: "Version Control",
  },
  {
    imageUrl: github,
    name: "GitHub",
    type: "Version Control",
  },
  {
    imageUrl: html,
    name: "HTML",
    type: "Frontend",
  },
  {
    imageUrl: javascript,
    name: "JavaScript",
    type: "Frontend",
  },
  {
    imageUrl: mongodb,
    name: "MongoDB",
    type: "Database",
  },
  {
    imageUrl: motion,
    name: "Motion",
    type: "Animation",
  },
  {
    imageUrl: mui,
    name: "Material-UI",
    type: "Frontend",
  },
  {
    imageUrl: nextjs,
    name: "Next.js",
    type: "Frontend",
  },
  {
    imageUrl: nodejs,
    name: "Node.js",
    type: "Backend",
  },
  {
    imageUrl: react,
    name: "React",
    type: "Frontend",
  },
  {
    imageUrl: redux,
    name: "Redux",
    type: "State Management",
  },
  {
    imageUrl: sass,
    name: "Sass",
    type: "Frontend",
  },
  {
    imageUrl: tailwindcss,
    name: "Tailwind CSS",
    type: "Frontend",
  },
  {
    imageUrl: typescript,
    name: "TypeScript",
    type: "Frontend",
  },
];

export const experiences = [
  {
    title: "Software Engineer",
    company_name: "Didero.ai",
    icon: meta,
    iconBg: "#a2d2ff",
    date: "August 2025 - Present",
    points: [
      "Building document comparison systems that make manual workflows obsolete—because nobody should spend their day comparing JSONs.",
      "Leading feature development and coordinating with the team to ship production-ready APIs.",
      "Creating AI-powered tools that intelligently navigate complex data structures.",
      "Making sure everything runs smoothly with comprehensive testing and optimized performance.",
    ],
  },
  {
    title: "AI Engineer Intern",
    company_name: "AI Singapore",
    icon: starbucks,
    iconBg: "#accbe1",
    date: "May 2025 - August 2025",
    points: [
      "Worked on SEA-LION v4, an LLM optimized for Southeast Asian languages and contexts.",
      "Built a multi-agent reward system that scores AI outputs—basically teaching AI to grade itself.",
      "Experimented with Monte Carlo tree search for code judging, boosting accuracy by 30%.",
      "Dove deep into RLHF methods and knowledge distillation to make models smarter and more stable.",
    ],
  },
  {
    title: "Part Time Software Engineer Intern",
    company_name: "NUS School of Social Science",
    icon: shopify,
    iconBg: "#b7e4c7",
    date: "January 2025 - May 2025",
    points: [
      "Explored how AI tools like DeepSeek can transform classroom experiences.",
      "Built web scrapers with Selenium and Playwright to automate content collection.",
      "Created a RAG system for auto-grading scripts—because grading shouldn't take forever.",
    ],
  },
  {
    title: "Co-founder and Software Engineer",
    company_name: "M.AI",
    icon: tesla,
    iconBg: "#fbc3bc",
    date: "April 2024 - May 2025",
    points: [
      "Co-founded an AI startup reimagining how brands create short-form video content.",
      "Built the full stack—from video uploads to AI-generated marketing scripts.",
      "Got into SMU's Business Innovations Generator (top 30 out of 138 startups!).",
      "Part of Asia's best-rated accelerator program in 2024. Pretty cool experience.",
    ],
  },
];

export const socialLinks = [
  {
    name: "Contact",
    iconUrl: contact,
    link: "/contact",
  },
  {
    name: "GitHub",
    iconUrl: github,
    link: "https://github.com/grassheadd",
  },
  {
    name: "LinkedIn",
    iconUrl: linkedin,
    link: "https://www.linkedin.com/in/junjiehu1/",
  },
];

export const projects = [
  {
    iconUrl: estate,
    theme: "btn-back-black",
    name: "EasyWeds",
    description:
      "Desktop wedding-planning app built on brownfield Java codebase. Redesigned data model with Weddings, Tasks, unique ID scheme, and entity tagging. Managed weekly syncs, GitHub Projects board, and shipped 4 releases with 80% code coverage.",
    link: "https://github.com/AY2425S2-CS2103T-F11-4/tp",
  },
  {
    iconUrl: summiz,
    theme: "btn-back-yellow",
    name: "Bilingual Sentiment Analysis LLM",
    description:
      "Fine-tuned Ollama-3.2-1B-Instruct model with LoRA using Unsloth. Performed EDA on multilingual datasets and generated synthetic data. Doubled sentiment prediction accuracy from 40% to 82% while maintaining general capabilities.",
    link: "https://github.com/grassheadd/Bilingual-Text-Sentiment-Prediction-LLM-Model",
  },
  {
    iconUrl: pricewise,
    theme: "btn-back-red",
    name: "QOLplus",
    description:
      "Multi-functional scheduler leveraging AI for intelligent task optimization and time management. Built with JavaScript to help users maximize productivity.",
    link: "https://github.com/grassheadd/QOLplus",
  },
  {
    iconUrl: threads,
    theme: "btn-back-green",
    name: "Project Eudaimonia",
    description:
      "Orbital 2024 project focused on well-being and personal development. Built with C# to create meaningful user experiences.",
    link: "https://github.com/grassheadd/Project-Eudaimonia",
  },
  {
    iconUrl: car,
    theme: "btn-back-blue",
    name: "QuackyBird",
    description:
      "Browser minigame extension inspired by 80s retro shooters and Flappy Bird mechanics. Fun, addictive gameplay built with JavaScript.",
    link: "https://github.com/grassheadd/QuackyBird",
  },
  {
    iconUrl: snapgram,
    theme: "btn-back-pink",
    name: "ILuvLeetcode",
    description:
      "Comprehensive collection of LeetCode problem solutions from February 2025 onwards. Python implementations with detailed explanations and optimizations.",
    link: "https://github.com/grassheadd/ILuvLeetcode",
  },
];
