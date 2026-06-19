import { SLIDE_TYPES } from "./deckBuilder";
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
      return "Проблема рынка";
    case "solution":
      return "Наше решение";
    case "market":
      return "Рынок и целевая аудитория";
    case "pricing":
      return "Бизнес-модель";
    case "sauce":
      return "Команда и продукт";
    case "competition":
      return "Конкуренты и отличие";
    case "launch":
      return "Выход на рынок (GTM)";
    case "risks":
      return "Риски и митигация";
    case "ask":
      return "Запрос к инвесторам";
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
        "Продукт: что делает пользователь за 10 секунд",
        "Ценность: экономия времени/денег",
        "Отличие: конкретный механизм, не «инновация»",
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
        "Средний чек: из фактов проекта",
        "Юнит-экономика: CAC и LTV — валидация",
      ];
    case "sauce":
      return [
        "Команда: ключевые роли",
        "Операционка: как реально работает сервис",
        "Технология: только подтверждённое",
      ];
    case "competition":
      return [
        "Прямые конкуренты: 2–3 игрока",
        "Почему уйдут к нам: конкретный механизм",
        "Барьер: не buzzword, а процесс/данные/сеть",
      ];
    case "launch":
      return [
        "Первые 100 пользователей: один канал",
        "География: один район/город для старта",
        "Метрика успеха за 90 дней",
      ];
    case "risks":
      return [
        "Операционный риск #1",
        "Юридический/регуляторный риск",
        "План снижения: конкретные шаги",
      ];
    case "ask":
      return [
        "Раунд: Seed / Pre-seed",
        "Сумма и runway",
        "На что пойдут средства",
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
