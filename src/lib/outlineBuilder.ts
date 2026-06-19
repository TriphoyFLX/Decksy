import { SLIDE_TYPES } from "./deckBuilder";
import { BUSINESS_SLIDE_SPECS } from "./businessSlides";
import type { Slide, ProjectBranding } from "../types";
import { resolveCompanyName, EMPTY_PROJECT_BRANDING } from "./projectBranding";

export interface OutlineSlide {
  id: string;
  type: Slide["type"];
  title: string;
  bullets: string[];
}

export interface PresentationOutline {
  title: string;
  subtitle: string;
  slides: OutlineSlide[];
}

const BUSINESS_SLIDE_HINTS: Record<Slide["type"], string> = {
  title: "Название стартапа и одна строка ценности",
  problem: "Кто клиент, какая боль, почему сейчас",
  solution: "Что делает продукт за 10 секунд, ключевые фичи",
  market: "TAM/SAM/SOM или сегменты ЦА с цифрами",
  pricing: "Модель монетизации, чек, юнит-экономика",
  sauce: "Команда, технология, операционное преимущество",
  competition: "Конкуренты и почему выберут вас",
  launch: "GTM: первые 100 пользователей, каналы",
  risks: "Реальные риски и как снижаете",
  ask: "Сумма раунда, на что пойдут деньги",
  traction: "Метрики, рост, доказательства спроса",
  tech: "Архитектура, стек, масштабирование",
};

export function generateLocalOutline(
  idea: string,
  mode: string,
  branding: ProjectBranding = EMPTY_PROJECT_BRANDING
): PresentationOutline {
  const name = resolveCompanyName(branding, idea);
  const slides: OutlineSlide[] = SLIDE_TYPES.map((type, i) => ({
    id: `outline_${i + 1}`,
    type,
    title: getDefaultOutlineTitle(type, name, idea, branding),
    bullets: getDefaultBullets(type, idea, mode, branding),
  }));

  return {
    title: name,
    subtitle: branding.tagline?.trim() || idea.slice(0, 120),
    slides,
  };
}

function getDefaultOutlineTitle(
  type: Slide["type"],
  name: string,
  idea: string,
  branding: ProjectBranding
): string {
  switch (type) {
    case "title":
      return name;
    case "problem":
      return BUSINESS_SLIDE_SPECS.problem.title;
    case "solution":
      return BUSINESS_SLIDE_SPECS.solution.title;
    case "product":
      return BUSINESS_SLIDE_SPECS.product.title;
    case "market":
      return BUSINESS_SLIDE_SPECS.market.title;
    case "competition":
      return BUSINESS_SLIDE_SPECS.competition.title;
    case "pricing":
      return BUSINESS_SLIDE_SPECS.pricing.title;
    case "traction":
      return BUSINESS_SLIDE_SPECS.traction.title;
    case "launch":
      return BUSINESS_SLIDE_SPECS.launch.title;
    case "sauce":
      return BUSINESS_SLIDE_SPECS.sauce.title;
    case "ask":
      return BUSINESS_SLIDE_SPECS.ask.title;
    case "vision":
      return BUSINESS_SLIDE_SPECS.vision.title;
    default:
      return BUSINESS_SLIDE_HINTS[type] || idea.slice(0, 50);
  }
}

function getDefaultBullets(
  type: Slide["type"],
  idea: string,
  mode: string,
  branding: ProjectBranding
): string[] {
  const base = idea.slice(0, 80);
  const investor = mode === "investor" || mode === "shark";
  switch (type) {
    case "title":
      return [
        branding.founderName ? `${branding.founderRole || "Основатель"}: ${branding.founderName}` : "Укажите имя владельца",
        branding.quote ? `«${branding.quote}»` : "Слоган или цитата бренда",
        branding.tagline || "Подзаголовок проекта",
      ].filter(Boolean);
    case "problem":
      return [
        `Клиент: ${base}`,
        "Боль: неудовлетворённая потребность на рынке",
        investor ? "Почему сейчас: окно возможностей" : "Контекст: тренд и спрос",
      ];
    case "solution":
      return [
        "Что делает продукт: 1–2 предложения",
        "Почему это работает",
        "Механизм ценности",
      ];
    case "product":
      return [
        "Фичи: 3 ключевые возможности",
        "User flow: путь пользователя",
        "MVP / демо / прототип",
      ];
    case "market":
      return [
        "TAM: требует оценки по нише",
        "ЦА: первичный сегмент запуска",
        "Спрос: сигналы от пользователей/рынка",
      ];
    case "pricing":
      return [
        "Модель: подписка / комиссия / транзакция",
        "Цена / средний чек",
        "CAC и LTV — валидация",
      ];
    case "traction":
      return [
        "Стадия: early stage / есть метрики",
        "Пользователи / выручка — только факты",
        "Пилоты / сигналы спроса",
      ];
    case "sauce":
      return [
        "Команда: кто и роли",
        "Почему потянут проект",
        "Пробелы и как закрываем",
      ];
    case "competition":
      return [
        "Прямые конкуренты: 2–3 игрока",
        "Почему уйдут к нам: конкретный механизм",
        "Барьер: не buzzword, а процесс/данные/сеть",
      ];
    case "launch":
      return [
        "Каналы привлечения",
        "Первые 1000 пользователей",
        "Метрика GTM за 90 дней",
      ];
    case "ask":
      return [
        "Сумма раунда",
        "На что пойдут средства",
        "Runway и для инвестора",
      ];
    case "vision":
      return [
        "Куда через 3–5 лет",
        "Почему может стать большим",
        "Миссия в одной фразе",
      ];
    default:
      return [base];
  }
}

export function outlineToDeckContext(outline: PresentationOutline): string {
  return outline.slides
    .map(
      (s, i) =>
        `Slide ${i + 1} [${s.type}]: ${s.title}\n${s.bullets.map((b) => `  • ${b}`).join("\n")}`
    )
    .join("\n\n");
}
