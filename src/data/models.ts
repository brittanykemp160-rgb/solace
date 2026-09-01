import type { Model } from '../types';

// PLACEHOLDER: the real list should come from the Solace backend.
export const MODELS: Model[] = [
  {
    id: 'deepseek-v4.1-flash-abliterated',
    name: 'DeepSeek V4.1 Flash Abliterated',
    short: 'DeepSeek V4.1 Flash',
    variant: 'Abliterated',
    provider: 'DeepSeek',
    description: 'Fast and light. Built for quick back-and-forth.',
    tag: 'Fast',
    logo: 'deepseek',
  },
  {
    id: 'kimi-k3-abliterated',
    name: 'Kimi K3 Abliterated',
    short: 'Kimi K3',
    variant: 'Abliterated',
    provider: 'Moonshot AI',
    description: 'Bigger model for deeper, multi-step work.',
    tag: 'Reasoning',
    logo: 'kimi',
  },
  {
    id: 'qwen-2.5-coder',
    name: 'Qwen 2.5 Coder',
    short: 'Qwen Coder',
    variant: 'Coder',
    provider: 'Alibaba',
    description: 'Optimized for code generation and analysis.',
    tag: 'Code',
    logo: 'qwen',
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;
export const MODEL_COUNT = MODELS.length;
export const isModelId = (id: string) => MODELS.some((m) => m.id === id);
export const modelById = (id: string): Model => MODELS.find((m) => m.id === id) ?? MODELS[0];

/** Loose match for `/model kimi`, `/model deepseek`, or a full id. */
export function findModel(query: string): Model | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return MODELS.find((m) => m.id === q) ?? MODELS.find((m) => m.id.includes(q) || m.name.toLowerCase().includes(q));
}
