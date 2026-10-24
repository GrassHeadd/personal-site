export interface ExpCard {
  title: string;
  company: string;
  date: string;
  responsibilities: string[];
}

export const expCards: ExpCard[] = [
  {
    title: "Software Engineer Intern",
    company: "Tencent",
    date: "Aug 2026 - now",
    responsibilities: [
      "Cut average frontend feature turnaround from two days to a few hours by building MCP tools and agent skills that let 8+ product managers generate, edit, and validate production code independently.",
      "Partnered with designers and product managers to migrate 30+ pages to UI v2, turning Figma designs into reusable design-system components.",
      "Cut a software-tiering page's render time by about 90% by precomputing its data in a scheduled job.",
      "Restored reliable preview environments for a team of 10 engineers by fixing stale branch-to-service routing entries.",
    ],
  },
  {
    title: "Member of Technical Staff",
    company: "Didero",
    date: "Aug 2025 - Jul 2026",
    responsibilities: [
      "Shipped task notes, team and supplier instructions, and accept, edit, or reject controls for AI-proposed emails and ERP writes. Across 20+ enterprise clients, agent task acceptance rose from 40% to 80% during the rollout.",
      "Co-led one of Didero's three core products: an AI accounts payable workflow with three-way matching, owner identification, and email follow-ups to resolve discrepancies; piloted it with 3 clients.",
      "Worked directly with a portfolio of 7 enterprise clients, integrating ERP write-backs and tailoring agent prompts and workflows to their operations.",
      "Built an agent trace explorer from scratch across 600K+ LLM and 540K+ tool calls per quarter, showing costs, latency, inputs, linked business records, and customer decisions.",
      "Diagnosed a runaway agent loop that cost $9K in 18 hours, then enabled prompt caching that now serves 36% of input tokens from cache.",
      "Built a configurable gate for inbound email, filtering 85% of roughly 30,000 monthly messages before downstream agents processed them.",
    ],
  },
  {
    title: "AI Engineer Intern",
    company: "AI Singapore",
    date: "May - Aug 2025",
    responsibilities: [
      "Built a multi-agent reward pipeline for SEA-LION v4, scoring 10 million synthetic examples across 10 Southeast Asian languages. The resulting model family ranked #4 of 55 on SEA-HELM.",
      "Led its code-judging agent, using Monte Carlo Tree Search to raise accuracy from 50% to 80% on a 2,000-example benchmark and cut scoring time from two minutes to under ten seconds.",
      "Benchmarked PPO and GRPO, then integrated the reward pipeline into reinforcement learning training with VeRL and vLLM.",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    responsibilities: [
      "Built RAG systems with DSPy and AI scrapers for dynamic sites.",
      "Evaluated AI tools for classroom teaching.",
    ],
  },
];
