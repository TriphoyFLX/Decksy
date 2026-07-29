import type { LegalPageId } from "../pages/LegalPage";

export type AppScreen =
  | "intro"
  | "outline"
  | "templates"
  | "interview"
  | "generating"
  | "deck"
  | "present"
  | "admin"
  | "about"
  | "plans"
  | "word";

export interface AppRoute {
  screen: AppScreen;
  openLibrary?: boolean;
}

const LEGAL_PATHS: Record<string, LegalPageId> = {
  "/offer": "offer",
  "/privacy": "privacy",
  "/contacts": "contacts",
  "/refunds": "refunds",
  "/service-delivery": "service-delivery",
};

/** Primary URL for each in-app screen */
export const APP_SCREEN_PATHS: Record<AppScreen, string> = {
  intro: "/",
  about: "/about",
  plans: "/plans",
  word: "/word",
  interview: "/chat",
  outline: "/outline",
  templates: "/templates",
  generating: "/generating",
  deck: "/deck",
  present: "/present",
  admin: "/admin",
};

type PathTarget = AppScreen | "projects";

const PATH_ALIASES: Record<string, PathTarget> = {
  "/": "intro",
  "/new": "intro",
  "/chat": "interview",
  "/interview": "interview",
  "/about": "about",
  "/plans": "plans",
  "/word": "word",
  "/outline": "outline",
  "/templates": "templates",
  "/generating": "generating",
  "/deck": "deck",
  "/present": "present",
  "/admin": "admin",
  "/projects": "projects",
};

export function normalizePathname(pathname: string): string {
  const base = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  return base;
}

export function getLegalPageFromPath(pathname: string): LegalPageId | null {
  return LEGAL_PATHS[normalizePathname(pathname)] || null;
}

export function resolveAppRoute(pathname: string): AppRoute {
  const path = normalizePathname(pathname);
  const alias = PATH_ALIASES[path];
  if (alias === "projects") {
    return { screen: "intro", openLibrary: true };
  }
  if (alias) {
    return { screen: alias };
  }
  return { screen: "intro" };
}

export function pathForAppScreen(screen: AppScreen, openLibrary?: boolean): string {
  if (openLibrary) return "/projects";
  return APP_SCREEN_PATHS[screen] ?? "/";
}

export function isKnownAppPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path in PATH_ALIASES || path in LEGAL_PATHS;
}

export const APP_SCREEN_LABELS: Record<AppScreen, string> = {
  intro: "Новый проект",
  word: "Word Generator",
  interview: "Интервью",
  outline: "План слайдов",
  templates: "Выбор шаблона",
  generating: "Сборка деки",
  deck: "Презентация",
  present: "Полный экран",
  about: "О проекте",
  plans: "Тарифы",
  admin: "Админка",
};
