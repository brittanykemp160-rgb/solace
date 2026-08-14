export type Role = 'user' | 'assistant' | 'system';

/** A placeholder for tool activity (read file, run command…) shown inline in a reply. */
export interface ToolStep {
  kind: 'read' | 'edit' | 'run' | 'search';
  label: string;
  detail?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  steps?: ToolStep[];
  streaming?: boolean;
}

export interface Session {
  id: string;
  title: string;
  folder: string | null;
  modelId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type PlanId = 'free' | 'plus' | 'unlimited';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  /** Tokens per day; null means unlimited. */
  dailyTokens: number | null;
  tagline: string;
  features: string[];
  /** Shows a short ad while the model is thinking. */
  ads: boolean;
  highlight?: boolean;
}

export interface Account {
  signedIn: boolean;
  name: string;
  email: string;
  planId: PlanId;
  tokensUsedToday: number;
  resetsAt: number;
}

export interface Model {
  id: string;
  /** Full display name, e.g. "Kimi K3 Abliterated". */
  name: string;
  /** Base name without the variant, used where space is tight. */
  short: string;
  variant: string;
  provider: string;
  description: string;
  tag: string;
  /** Provider logo shown in the model's badge. */
  logo: 'deepseek' | 'kimi' | 'qwen';
}

export type ThemePref = 'system' | 'light' | 'dark';
export type View = 'chat' | 'settings' | 'plans';
export type SettingsSection = 'general' | 'appearance' | 'models' | 'account' | 'privacy' | 'about';
