import type { Message, Mode, PitchCanvas } from "../types";

const SESSION_KEY = "decksy_chat_session_v1";

export interface PersistedChatSession {
  idea: string;
  mode: Mode;
  messages: Message[];
  canvas: PitchCanvas;
  screen: "intro" | "interview" | "generating" | "deck" | "admin" | "about" | "plans";
  currentQuestionIndex: number;
  investorSentiment: string;
  underlyingThoughts: string;
  savedAt: number;
}

export function loadChatSession(): PersistedChatSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedChatSession;
    if (!parsed?.messages?.length) return null;
    if (Date.now() - (parsed.savedAt || 0) > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveChatSession(session: Omit<PersistedChatSession, "savedAt">) {
  try {
    const payload: PersistedChatSession = { ...session, savedAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Could not persist chat session", e);
  }
}

export function clearChatSession() {
  localStorage.removeItem(SESSION_KEY);
}

const IMAGES_KEY = "decksy_session_images_v1";

export function loadSessionImages(): { id: string; image: string; description: string }[] {
  try {
    const raw = sessionStorage.getItem(IMAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSessionImages(images: { id: string; image: string; description: string }[]) {
  try {
    if (!images.length) {
      sessionStorage.removeItem(IMAGES_KEY);
      return;
    }
    sessionStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  } catch (e) {
    console.warn("Could not persist session images (quota)", e);
  }
}

export function clearSessionImages() {
  sessionStorage.removeItem(IMAGES_KEY);
}

export async function compressDataUrl(dataUrl: string, maxW = 1280, quality = 0.85): Promise<string> {
  if (!dataUrl.startsWith("data:image")) return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / Math.max(img.width, 1));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function compressSessionImages(
  images: { id: string; image: string; description: string }[]
) {
  const compressed = await Promise.all(
    images.map(async (img) => ({
      ...img,
      image: await compressDataUrl(img.image),
    }))
  );
  return compressed;
}
