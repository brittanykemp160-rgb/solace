import type { Plan } from '../types';

// Public-facing plan definitions shown in the app.
// Internal notes on how these may change live in docs/PRICING.md — keep that
// language out of the UI.

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    dailyTokens: 5_000_000,
    tagline: 'Everything you need to get started.',
    features: [
      '5 million tokens every day',
      'All core models',
      'Unlimited sessions',
      'A short ad while Solace thinks',
    ],
    ads: true,
  },
  {
    id: 'plus',
    name: 'Plus',
    priceMonthly: 15,
    dailyTokens: 100_000_000,
    tagline: 'For people who use Solace all day.',
    features: [
      '100 million tokens every day',
      'Priority response speed',
      'Early access to new models',
      'Everything in Free, same short ads',
    ],
    ads: true,
    highlight: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    priceMonthly: 35,
    dailyTokens: null,
    tagline: 'No daily limits. Ever.',
    features: [
      'Unlimited tokens',
      'Highest priority',
      'No ads',
      'Everything in Plus',
    ],
    ads: false,
  },
];

export const planById = (id: Plan['id']): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0];

export const isPaidPlan = (id: Plan['id']): boolean => id !== 'free';

export const formatPrice = (plan: Plan): string =>
  plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly}/mo`;
