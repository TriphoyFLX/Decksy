export type Mode = 'quick' | 'investor' | 'shark';

export interface Message {
  id: string;
  sender: 'user' | 'investor';
  text: string;
  timestamp: string;
}

export interface CanvasSection {
  title: string;
  summary: string;
  bullets: string[];
  status: 'locked' | 'thinking' | 'compiled';
}

export interface PitchCanvas {
  problem: CanvasSection;
  solution: CanvasSection;
  market: CanvasSection;
  moneyModel: CanvasSection;
  competitors: CanvasSection;
  goToMarket: CanvasSection;
  risks: CanvasSection;
  branding: CanvasSection;
  _deckTheme?: DeckThemeCustom;
}

export interface ConstructorElementPos {
  x: number;
  y: number;
  w?: number;
  h?: number;
}

export interface SlideConstructorLayout {
  enabled?: boolean;
  positions?: {
    logo?: ConstructorElementPos;
    title?: ConstructorElementPos;
    subtitle?: ConstructorElementPos;
    founder?: ConstructorElementPos;
    quote?: ConstructorElementPos;
  };
}

export interface SlideVisualData {
  template?: 'apex' | 'swiss';
  deckTemplate?: 'apex' | 'swiss' | 'titanium' | 'ember' | 'midnight' | 'studio';
  variant?: string;
  layout?: 'default' | 'hero' | 'split' | 'team' | 'gallery' | 'metrics' | 'timeline' | 'pricing' | 'matrix';
  teamMembers?: { name: string; role: string; image: string }[];
  metrics?: { label: string; value: string; highlight?: boolean }[];
  timeline?: { label: string; title: string; detail?: string }[];
  pricing?: { label: string; price: string; detail?: string; featured?: boolean }[];
  competitors?: { label: string; detail: string; ours?: boolean }[];
  accentImage?: string;
  images?: string[];
  constructorLayout?: SlideConstructorLayout;
}

export interface Slide {
  title: string;
  subtitle?: string;
  content: string[];
  type: 'title' | 'problem' | 'solution' | 'product' | 'market' | 'pricing' | 'competition' | 'launch' | 'risks' | 'traction' | 'ask' | 'sauce' | 'tech' | 'vision';
  visualData?: SlideVisualData;
  speechScript: string; // The speech script for this slide
  image?: string; // Base64 data-URL or image URL
  imageDescription?: string; // Theme or what is depicted in the image
  badge?: string;
  sectionLabel?: string;
  founderName?: string;
  founderRole?: string;
  brandQuote?: string;
}

export interface ProjectBranding {
  companyName: string;
  tagline: string;
  founderName: string;
  founderRole: string;
  quote: string;
  logoImage?: string;
  /** Пожелания по конкретным слайдам из интервью */
  slideNotes?: string;
}

import type { DeckDesignPlan } from "./lib/designPlan";

export interface PitchDeck {
  id: string;
  title: string;
  subtitle: string;
  idea: string;
  mode: Mode;
  slides: Slide[];
  theme?: DeckThemeCustom;
  roast?: {
    score: number; // 0 to 100
    verdict: string; // e.g., "REJECT", "SEEK CLARITY", "TERM SHEET"
    roastText: string; // Detailed brutal VC roast
    weakSpots: string[]; // List of specific vulnerabilities
    recommendations: string[]; // How to fix them
  };
  designPlan?: DeckDesignPlan;
}

export interface DeckThemeCustom {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  frameGradient?: string;
  borderColor?: string;
}

export interface InterviewSession {
  id: string;
  idea: string;
  mode: Mode;
  messages: Message[];
  canvas: PitchCanvas;
  currentQuestionIndex: number;
  maxQuestions: number;
  investorSentiment: 'skeptical' | 'bored' | 'intrigued' | 'impressed' | 'combative';
}
