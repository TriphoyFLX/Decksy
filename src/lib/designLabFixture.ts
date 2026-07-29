import type { PitchDeck, Slide } from "../types";
import { TEMPLATE_CATALOG, type DeckTemplateId } from "./deckTheme";
import { assignDeckVariants } from "./deckVariants";

/** Clean demo company — no junk titles from briefs */
const DEMO_COMPANY = "NordFlow";
const DEMO_TAGLINE = "Почасовая аренда спецтехники без покупки";

function buildDemoSlides(): Slide[] {
  return [
    {
      type: "title",
      title: DEMO_COMPANY,
      subtitle: DEMO_TAGLINE,
      badge: "PITCH DECK",
      founderName: "Алексей Петров",
      founderRole: "Основатель / CEO",
      brandQuote: "Дорогой инструмент не должен простаивать",
      content: [
        "Основатель: Алексей Петров",
        "«Дорогой инструмент не должен простаивать»",
      ],
      speechScript: "Меня зовут Алексей, я основатель NordFlow — сервиса почасовой аренды спецтехники.",
    },
    {
      type: "problem",
      title: "Проблема → Решение",
      subtitle: "Боль рынка и как мы её закрываем",
      sectionLabel: "01 · Боль",
      content: [
        "Покупка: Владение спецтехникой невыгодно для разовых работ",
        "Простой: Оборудование стоит 40–70% времени без загрузки",
        "Поиск: Аренда через объявления — хаос без гарантий",
        "Риск: Штрафы и споры съедают маржу подрядчика",
      ],
      visualData: {
        problemSolutions: [
          {
            problemLabel: "Покупка",
            problem: "Владение спецтехникой невыгодно для разовых и сезонных работ",
            solutionLabel: "Почасовая аренда",
            solution: "От 100 ₽/час — без кредита и простоя капитала",
          },
          {
            problemLabel: "Простой",
            problem: "Оборудование стоит 40–70% времени без загрузки",
            solutionLabel: "Маркетплейс загрузки",
            solution: "Сводим спрос и парк — техника работает, а не пылится",
          },
          {
            problemLabel: "Поиск",
            problem: "Аренда через объявления — хаос, нет гарантий и цен",
            solutionLabel: "Онлайн-бронь",
            solution: "Прозрачный каталог, слот, оплата и договор в одном месте",
          },
          {
            problemLabel: "Риск",
            problem: "Штрафы, простой и споры съедают маржу",
            solutionLabel: "Страховка + SLA",
            solution: "Страховка, рейтинг и фото-фиксация на выдаче/возврате",
          },
        ],
      },
      speechScript: "Подрядчики либо покупают технику в кредит, либо теряют дни на поиск аренды — мы закрываем обе боли.",
    },
    {
      type: "solution",
      title: "Решение NordFlow",
      subtitle: "Аренда без покупки — прозрачно и онлайн",
      sectionLabel: "02 · Решение",
      content: [
        "Цена: от 100 ₽/час — ниже рынка на 15–25%, без залога «на глаз»",
        "Экономия: до 60% vs покупка при загрузке до 3 дней в неделю",
        "Лояльность: кэшбек, приоритет слотов и рейтинг для повторных клиентов",
        "Онлайн: бронь, оплата, страховка и договор в одном приложении",
      ],
      speechScript: "NordFlow — маркетплейс почасовой аренды с прозрачными тарифами.",
    },
    {
      type: "product",
      title: "Продукт",
      subtitle: "Как это работает",
      sectionLabel: "03 · Продукт",
      content: [
        "Выбор: Каталог техники рядом с объектом — фильтр по типу и цене",
        "Бронь: Слот на час или день, мгновенное подтверждение",
        "Выдача: QR-код на объекте, страховка и договор в приложении",
        "Возврат: Фото-фиксация и авто-закрытие заказа",
      ],
      speechScript: "Пользователь выбирает технику, бронирует слот и получает QR для выдачи.",
    },
    {
      type: "market",
      title: "Рынок",
      subtitle: "TAM / SAM / SOM",
      sectionLabel: "04 · Рынок",
      content: [
        "TAM: 10 млрд ₽ — рынок аренды спецтехники в РФ",
        "SAM: 1.2 млрд ₽ — города-миллионники, B2B подрядчики",
        "SOM: 80 млн ₽ — пилот в 3 городах за 24 месяца",
        "Рост: рынок аренды +12% YoY на фоне удорожания техники",
      ],
      visualData: {
        metrics: [
          { label: "TAM", value: "10 млрд ₽", highlight: true },
          { label: "SAM", value: "1.2 млрд ₽" },
          { label: "SOM", value: "80 млн ₽" },
        ],
      },
      speechScript: "Стартуем с SAM в миллионниках, цель — 80 млн выручки за два года.",
    },
    {
      type: "competition",
      title: "Конкуренты",
      subtitle: "Почему мы",
      sectionLabel: "05 · Конкуренция",
      content: [
        "Авито / объявления: Нет гарантий, цены хаотичны, нет страховки",
        "Локальные парки: Узкий ассортимент, ручной процесс, высокий залог",
        "NordFlow: Почасово, онлайн, страховка, рейтинг и SLA",
        "Моат: Сеть партнёров + данные загрузки по районам",
      ],
      visualData: {
        competitors: [
          {
            label: "Авито / объявления",
            detail: "Хаос цен, нет гарантий",
            tagline: "Доски объявлений",
            ours: false,
            rating: 4,
            advantages: ["Большой трафик", "Низкий порог входа"],
          },
          {
            label: "Локальный парк",
            detail: "Узкий ассортимент, ручной процесс",
            tagline: "Классическая аренда",
            ours: false,
            rating: 5,
            advantages: ["Живая техника рядом", "Знакомый менеджер"],
          },
          {
            label: "СтройПрокат+",
            detail: "Региональный игрок без digital",
            tagline: "Офлайн-сеть",
            ours: false,
            rating: 6,
            advantages: ["Свой парк", "B2B опыт"],
          },
          {
            label: "NordFlow",
            detail: "Почасово + страховка + онлайн",
            tagline: "Marketplace аренды",
            ours: true,
            rating: 9,
            advantages: [
              "Почасовая бронь",
              "Страховка и SLA",
              "Рейтинг подрядчиков",
              "Данные загрузки",
              "Прозрачные цены",
              "QR-выдача",
            ],
          },
        ],
        compareFeatures: [
          { label: "Почасовая аренда", scores: [false, "partial", false, true] },
          { label: "Онлайн-бронь и оплата", scores: ["partial", false, false, true] },
          { label: "Страховка / SLA", scores: [false, "partial", "partial", true] },
          { label: "Рейтинг и отзывы", scores: ["partial", false, false, true] },
          { label: "Широкий ассортимент", scores: [true, false, "partial", true] },
          { label: "Данные / аналитика", scores: [false, false, false, true] },
          { label: "B2B контракты", scores: [false, "partial", true, true] },
        ],
      },
      speechScript: "Мы не конкурируем с покупкой — забираем сегмент разовых работ у объявлений.",
    },
    {
      type: "pricing",
      title: "Бизнес-модель",
      subtitle: "Почасовая аренда + комиссия",
      sectionLabel: "06 · Модель",
      content: [
        "Цена: 100–450 ₽/час в зависимости от класса техники",
        "LTV/CAC: цель 3x после валидации каналов",
        "Комиссия: 18% с заказа владельцу парка",
        "Лояльность: подписка для подрядчиков — −10% и приоритет",
      ],
      visualData: {
        pricing: [
          { label: "Старт", price: "100 ₽/ч", detail: "Лёгкий инструмент", featured: false },
          { label: "Про", price: "250 ₽/ч", detail: "Средний класс", featured: true },
          { label: "Хэви", price: "450 ₽/ч", detail: "Тяжёлая техника", featured: false },
        ],
      },
      speechScript: "Берём комиссию 18%, unit-экономика сходится при 40% загрузке парка.",
    },
    {
      type: "traction",
      title: "Traction",
      subtitle: "Ранняя стадия",
      sectionLabel: "07 · Traction",
      content: [
        "Пилот: 12 партнёров-парков в одном городе",
        "Спрос: 340 заявок за 90 дней, 28% конверсия в бронь",
        "NPS: 62 по опросу 40 подрядчиков",
        "Следующий milestone: 3 города и 50 парков за 90 дней",
      ],
      speechScript: "Мы на ранней стадии, но сигналы спроса уже валидируем цифрами пилота.",
    },
    {
      type: "launch",
      title: "Go-To-Market",
      subtitle: "Как растём",
      sectionLabel: "08 · GTM",
      content: [
        "Q1: Партнёрства с парками — 20 контрактов",
        "Q2: Performance в Telegram и Яндекс — CAC < 900 ₽",
        "Q3: Sales в строительные подрядчики — 15 B2B сделок",
        "Q4: Реферальная программа — 20% новых через друзей",
      ],
      visualData: {
        timeline: [
          { label: "Q1", title: "Партнёры", detail: "20 парков" },
          { label: "Q2", title: "Performance", detail: "CAC < 900 ₽" },
          { label: "Q3", title: "B2B sales", detail: "15 подрядчиков" },
          { label: "Q4", title: "Рефералы", detail: "20% organic" },
        ],
      },
      speechScript: "Сначала supply (парки), потом demand через performance и B2B.",
    },
    {
      type: "sauce",
      title: "Команда",
      subtitle: "Кто делает",
      sectionLabel: "09 · Команда",
      content: [
        "CEO: 8 лет в аренде и логистике B2B",
        "CTO: Ex-marketplace, 2 выхода в продукт",
        "Ops: Сеть из 12 парков уже в пилоте",
        "Advisor: Партнёр строительного холдинга",
      ],
      visualData: {
        layout: "team",
        teamMembers: [
          { name: "Алексей Петров", role: "CEO", image: "" },
          { name: "Мария Ковалёва", role: "CTO", image: "" },
          { name: "Игорь Семёнов", role: "Ops", image: "" },
        ],
      },
      speechScript: "Команда сочетает операционку аренды и опыт marketplace.",
    },
    {
      type: "ask",
      title: "Запрос",
      subtitle: "Seed round",
      sectionLabel: "10 · Ask",
      content: [
        "Раунд: 25 млн ₽ seed",
        "Use of funds: 45% supply, 30% product, 25% growth",
        "Цель: 3 города, 50 парков, unit-экономика в плюс",
        "Контакт: alexey@nordflow.ru",
      ],
      speechScript: "Поднимаем 25 млн на расширение парков и продукт.",
    },
    {
      type: "vision",
      title: "Vision",
      subtitle: "Куда идём",
      sectionLabel: "11 · Vision",
      content: [
        "Сеть: операционная система аренды спецтехники в СНГ",
        "Данные: прогноз загрузки по районам и сезонам",
        "B2B: корпоративные контракты для девелоперов",
        "Масштаб: выход в 15 городов за 5 лет",
      ],
      speechScript: "Хотим стать инфраструктурой аренды техники, а не ещё одним объявлением.",
    },
  ];
}

export function buildDesignLabDeck(templateId: DeckTemplateId): PitchDeck {
  const deck: PitchDeck = {
    id: `design-lab-${templateId}`,
    title: DEMO_COMPANY,
    subtitle: DEMO_TAGLINE,
    idea: "Маркетплейс почасовой аренды спецтехники для подрядчиков",
    mode: "investor",
    slides: buildDemoSlides().map((s) => ({
      ...s,
      content: [...s.content],
      visualData: s.visualData ? { ...s.visualData } : undefined,
    })),
  };
  assignDeckVariants(deck, deck.idea, 1, templateId);
  return deck;
}

export const DESIGN_LAB_TEMPLATES = Object.keys(TEMPLATE_CATALOG) as DeckTemplateId[];

export function getDesignLabMeta(templateId: DeckTemplateId) {
  return TEMPLATE_CATALOG[templateId];
}
