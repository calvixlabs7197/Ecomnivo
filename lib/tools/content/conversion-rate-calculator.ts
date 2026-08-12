import type { ToolDefinition } from "@/lib/tools/types";
import type { ConversionRateInput } from "@/lib/tools/engines/conversion-rate-calculator";

export const conversionRateContent: ToolDefinition<ConversionRateInput> = {
  slug: "conversion-rate-calculator",
  h1: "Conversion Rate Calculator",
  intro:
    "Conversion rate is the share of visits that turn into orders. It is the cheapest lever you have: improving it lifts revenue from traffic you have already paid for, and it lowers your cost per order at the same time.",

  formula: {
    expression: "Conversion rate = (Conversions ÷ Sessions) × 100",
    explanation:
      "Divide orders by sessions over the same period. Use sessions rather than users, and keep the choice consistent — one person visiting three times is three sessions, and switching between the two measures will appear to change your rate when nothing has.",
  },

  example: {
    inputs: { sessions: 25000, conversions: 450, targetRate: 2.5 },
    narrative:
      "A store gets 25,000 sessions and 450 orders: 450 ÷ 25,000 = 1.80%. Lifting that to 2.5% against the same traffic would produce 625 orders — 175 more, without buying a single extra visit.",
  },

  interpretation: [
    "Conversion rate improvements compound with everything else. A better rate lowers cost per acquisition and raises revenue per session simultaneously.",
    "Segment before drawing conclusions. Mobile and desktop rates usually differ substantially, as do new and returning visitors, and a blended figure hides both.",
    "Traffic quality moves the rate as much as the site does. A broad campaign that doubles sessions will usually lower the rate without anything on the site getting worse.",
    "Rates vary hugely by category and price point. Considered, expensive purchases convert far lower than cheap repeat ones, and that is not a fault.",
  ],

  commonMistakes: [
    "Mixing users and sessions between the numerator and denominator, which produces a number that is neither.",
    "Comparing against a published industry average built from a completely different mix of traffic, price and category.",
    "Calling a test result from a few hundred sessions. Conversion rates need far more traffic than most people expect before a difference is real.",
    "Chasing rate at the expense of order value — discounting lifts conversion rate and can lower total profit.",
  ],

  faqs: [
    {
      q: "What is a good conversion rate?",
      a: "It depends on category, price point and traffic mix, so a single benchmark is close to meaningless. A store selling inexpensive repeat-purchase goods converts far higher than one selling considered purchases. Compare your own rate over time and by segment instead.",
    },
    {
      q: "Should I use sessions or users?",
      a: "Sessions is the more common denominator and the one most analytics tools default to. Either can work, but be consistent — switching between them changes the figure without anything about the business changing.",
    },
    {
      q: "How much traffic do I need to test a change?",
      a: "More than most people assume. Detecting a small relative improvement at a low base rate can take tens of thousands of sessions per variant. Calling a winner early is the most common way tests produce changes that do not hold.",
    },
    {
      q: "Why did my conversion rate fall when I increased ad spend?",
      a: "Scaling spend reaches less interested people, so the average visitor is less likely to buy. A falling rate alongside rising total orders is normal and not necessarily a problem — judge it on cost per order and profit.",
    },
  ],

  relatedTools: ["revenue-calculator", "aov-calculator", "cpa-calculator"],
  relatedGuides: [],

  seo: {
    title: "Conversion Rate Calculator — Sessions to Orders",
    description:
      "Free conversion rate calculator. Enter sessions and orders to get your conversion rate, and see the extra orders a target rate would produce.",
  },
};
