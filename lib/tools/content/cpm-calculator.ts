import type { ToolDefinition } from "@/lib/tools/types";
import type { CpmInput } from "@/lib/tools/engines/cpm-calculator";

export const cpmContent: ToolDefinition<CpmInput> = {
  slug: "cpm-calculator",
  h1: "CPM Calculator",
  intro:
    "CPM is what you pay for a thousand impressions. It is the standard way to compare the cost of reach across platforms and placements, because it strips out how big each buy was. Add a click count and this also gives you click-through rate and cost per click.",

  formula: {
    expression: "CPM = (Ad spend ÷ Impressions) × 1,000",
    explanation:
      "Work out the cost of a single impression, then scale it to a thousand. The multiplier exists purely because the cost of one impression is an awkward number to read — a CPM of 5.00 is a cost of 0.005 per impression.",
  },

  example: {
    inputs: { adSpend: 500, impressions: 100000, clicks: 1250 },
    narrative:
      "A campaign spends 500 and is served 100,000 times. 500 ÷ 100,000 = 0.005 per impression, or 5.00 per thousand. Those impressions produced 1,250 clicks, a click-through rate of 1.25%, which puts the cost per click at 0.40.",
  },

  interpretation: [
    "CPM measures the cost of being seen, not the cost of a result. A low CPM on an audience that never buys is not a saving.",
    "Rising CPMs usually mean more competition for the same audience, or an audience you have saturated. Both are reasons to widen targeting or refresh creative.",
    "CPM and CPC move together through click-through rate: at a fixed CPM, doubling your click-through rate halves your cost per click.",
    "Compare CPMs only across similar placements. Prime placements on a major platform cost several times what remnant inventory does, and they are not buying the same attention.",
  ],

  commonMistakes: [
    "Choosing placements on CPM alone. The cheapest thousand impressions are usually the least valuable thousand impressions.",
    "Comparing CPM across platforms with different viewability standards — an 'impression' does not mean the same thing everywhere.",
    "Forgetting that CPM is per thousand. Dividing spend by impressions and reporting that number as CPM understates it by a factor of 1,000.",
    "Judging a brand campaign by CPM alone when the goal was reach and frequency against a specific audience.",
  ],

  faqs: [
    {
      q: "What does CPM stand for?",
      a: "Cost per mille — mille being Latin for thousand. It is the cost of a thousand ad impressions, not the cost per thousand clicks or customers.",
    },
    {
      q: "What is a good CPM?",
      a: "It depends entirely on the platform, the audience and the season. A narrow, high-value audience costs far more per thousand impressions than a broad one, and rates rise sharply in the run-up to major shopping periods. Compare your CPM against your own history on the same placement rather than against a published average.",
    },
    {
      q: "Is a lower CPM always better?",
      a: "No. CPM tells you what reach costs, not what it is worth. A campaign with double the CPM but four times the click-through rate delivers cheaper clicks and, usually, cheaper orders.",
    },
    {
      q: "How do CPM, CPC and CTR relate?",
      a: "CPC = CPM ÷ (click-through rate × 1,000 ÷ 100). In practice: work out how many clicks a thousand impressions produce at your click-through rate, then divide the CPM by that number. This calculator does it for you when you enter clicks.",
    },
  ],

  relatedTools: ["ctr-calculator", "cpc-calculator", "roas-calculator"],
  relatedGuides: [],

  seo: {
    title: "CPM Calculator — Cost Per Thousand Impressions",
    description:
      "Free CPM calculator. Enter ad spend and impressions to get cost per thousand, plus click-through rate and cost per click. Formula and worked example included.",
  },
};
