import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Flame, 
  Lock, 
  Unlock, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Volume2, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  Award,
  LockKeyhole,
  User,
  LogIn,
  LogOut,
  Database,
  Save,
  Trash2,
  FolderHeart,
  Folder,
  Menu,
  Settings,
  Megaphone,
  Info,
  X,
  Image,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminPanel } from "./components/AdminPanel";
import { SubscriptionPlans } from "./components/SubscriptionPlans";
import { SlideRenderer, getThemeStyles as getThemeStylesShared } from "./components/SlideRenderer";
import { AboutPage } from "./pages/AboutPage";
import { IntroPage } from "./pages/IntroPage";
import { GeneratingPage } from "./pages/GeneratingPage";
import { InterviewPage } from "./pages/InterviewPage";
import { DeckPage } from "./pages/DeckPage";
import { LegalPage, LegalPageId } from "./pages/LegalPage";
import { exportToPPTX } from "./lib/pptxExport";
import html2canvas from "html2canvas";
import {
  exportImagesToPDF,
  exportImagesToPPTX,
  patchComputedStyle,
  downloadSlidesAsZIP,
  getExportHtml2canvasOptions,
  EXPORT_SLIDE_WIDTH,
  EXPORT_SLIDE_HEIGHT,
} from "./lib/exportUtils";
import { generatePythonPPTXCode } from "./lib/pythonGenerator";
import { Mode, Message, PitchCanvas, PitchDeck, Slide } from "./types";
import { normalizeDeck, generateLocalDeck } from "./lib/deckBuilder";
import { EditableText } from "./components/EditableText";
import decksyLogo from "./images/logo.png";

const INITIAL_CANVAS: PitchCanvas = {
  problem: { title: "🧩 Проблема", summary: "Ожидание более детальных ответов на вопросы инвестора...", bullets: [], status: "locked" },
  solution: { title: "⚙️ Решение", summary: "Формулируется по ходу диалога...", bullets: [], status: "locked" },
  market: { title: "👥 Клиент и Рынок", summary: "Определяем TAM/SAM/SOM...", bullets: [], status: "locked" },
  moneyModel: { title: "💵 Модель Монетизации", summary: "Разрабатываем юнит-экономику...", bullets: [], status: "locked" },
  competitors: { title: "🥊 Конкуренты и Moat", summary: "Анализируем рыночные барьеры...", bullets: [], status: "locked" },
  goToMarket: { title: "🚀 Выход на Рынок (GTM)", summary: "Построение вирусных воронок...", bullets: [], status: "locked" },
  risks: { title: "⚡ Критические Риски", summary: "Аудит уязвимостей startup...", bullets: [], status: "locked" },
  branding: { title: "✨ Брендинг и Стиль", summary: "Определяем логотип, цвета и позиционирование...", bullets: [], status: "locked" }
};

const legalPagesByPath: Record<string, LegalPageId> = {
  "/offer": "offer",
  "/privacy": "privacy",
  "/contacts": "contacts",
  "/refunds": "refunds",
  "/service-delivery": "service-delivery",
};

function getLegalPageFromPath(pathname: string): LegalPageId | null {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return legalPagesByPath[normalizedPath] || null;
}

const EXAMPLE_DECKS = [
  {
    id: "example-ecocharge",
    title: "EcoCharge",
    subtitle: "Зарядные станции нового поколения",
    idea: "Сеть ультрабыстрых экологичных зарядных станций для электромобилей на солнечной энергии",
    mode: "investor" as Mode,
    style: "cosmic-dark" as const,
    industry: "GreenTech / EV",
    description: "Блестящий пример стартапа в сфере экологического транспорта. Идеален для демонстрации устойчивого развития и инновационного решения инфраструктуры.",
    slides: [
      {
        title: "EcoCharge: Зарядка Будущего",
        subtitle: "Ультрабыстрые зеленые зарядные хабы нового поколения",
        content: [
          "Ключевая ценность: Полный заряд батареи до 80% всего за 12 минут",
          "Инфраструктура: 100% автономная работа за счет крышных солнечных панелей",
          "Потенциал рынка: TAM в размере $12.4 млрд к 2028 году",
          "Экология: Снижение углеродного следа на 4.2 тонны CO2 в год с одной станции"
        ],
        type: "title" as const,
        sectionLabel: "⚡ Раздел 01 • Презентация",
        speechScript: "Уважаемые инвесторы, мы рады представить проект EcoCharge — первую сеть полностью автономных супербыстрых станций. Наша революционная технология позволяет заряжать электромобили за 12 минут, решая главную боль водителей."
      },
      {
        title: "Проблема & Наше Решение",
        subtitle: "От долгого ожидания к моментальной зеленой энергии",
        content: [
          "Проблема: Среднее время ожидания у традиционных станций составляет 3.5 часа",
          "Уникальность: Станция накапливает избыток энергии в буферных накопителях LFP",
          "Технология: Запатентованное жидкостное охлаждение силовых кабелей на 450 кВт",
          "Доступность: Полная интеграция с навигаторами и бронирование слота в приложении"
        ],
        type: "solution" as const,
        sectionLabel: "💡 Раздел 02 • Решение",
        speechScript: "Существующая сетевая инфраструктура перегружена, а водители часами ждут своей очереди. Наше решение работает без дорогого подключения к сети общего пользования — буферные накопители выдают до 450 кВт пиковой мощности мгновенно."
      },
      {
        title: "Целевой Рынок & Бизнес-модель",
        subtitle: "Масштабируемая подписка с высокой лояльностью",
        content: [
          "Целевая аудитория: Более 500 тыс. активных владельцев электромобилей в мегаполисах",
          "B2B-партнеры: Договоры о размещении хабов с 24 крупными торговыми центрами",
          "Монетизация: Подписка за $49/месяц для безлимитной ночной зарядки",
          "Проекция выручки: Выход на ARR в размере $18 млн к концу 2-го года"
        ],
        type: "market" as const,
        sectionLabel: "👥 Раздел 03 • Рынок",
        speechScript: "Мы целимся в премиум-сегмент городских водителей. Наша модель подписки обеспечивает стабильный прогнозируемый доход, а партнерские хабы на парковках ТРЦ гарантируют постоянный приток лояльных клиентов."
      }
    ]
  },
  {
    id: "example-novahealth",
    title: "NovaHealth AI",
    subtitle: "Интеллектуальный медицинский триаж",
    idea: "Система ИИ-диагностики и предварительного анализа симптомов для клиник",
    mode: "investor" as Mode,
    style: "cobalt" as const,
    industry: "Digital Health / AI",
    description: "Медицинский ИИ-ассистент с выверенными показателями точности и масштабом интеграции. Демонстрирует силу глубоких b2b-технологий.",
    slides: [
      {
        title: "NovaHealth AI: Умный Триаж",
        subtitle: "Оптимизация потока пациентов и мгновенная точная диагностика",
        content: [
          "Суть ИИ: Первичный опрос и анализ жалоб происходят за 2.5 минуты",
          "Точность: 99.4% правильных диагнозов на основе обработки 45 млн карт",
          "Интеграция: Бесшовная связка с шиной МИС и календарями врачей клиники",
          "Масштаб рынка: $40 млрд — перспективный сегмент Digital Health в СНГ"
        ],
        type: "title" as const,
        sectionLabel: "🏥 Раздел 01 • Рецепция будущего",
        speechScript: "NovaHealth AI — это виртуальный помощник врача, который берет на себя рутину сбора анамнеза. Пациент проходит умный опрос перед визитом, разгружая медицинский персонал на 35%."
      },
      {
        title: "Клиническая Эффективность",
        subtitle: "Снижаем выгорание персонала и спасаем жизни",
        content: [
          "Боль клиник: Врачи тратят до 40% времени на заполнение медкарты вхолостую",
          "Автоматизация: ИИ оцифровывает жалобы и формирует готовую карту с кодами МКБ-10",
          "Приоритеты: Определение критических состояний пациентов в очереди за секунды",
          "Безопасность: Локальное размещение баз данных по стандарту 152-ФЗ"
        ],
        type: "solution" as const,
        sectionLabel: "🧠 Раздел 02 • Продукт",
        speechScript: "Благодаря умной категоризации, пациенты со сложными или опасными симптомами направляются к профильному специалисту мгновенно, минуя долгое ожидание в общей очереди."
      },
      {
        title: "Бизнес-Модель & Экономика",
        subtitle: "Стабильный рост в сегментах B2B и B2G",
        content: [
          "Тарифная сетка: SaaS-лицензия за $150 в месяц на одного активного врача",
          "LTV/CAC: Качественное превосходство экономики с удержанием 94% клиник",
          "Пилотные запуски: 12 ведущих госпиталей уже тестируют NovaHealth AI прямо сейчас",
          "Экономия: Снижение издержек на администрирование клиники до 25% в год"
        ],
        type: "pricing" as const,
        sectionLabel: "📊 Раздел 03 • Финансы",
        speechScript: "С нашей SaaS-моделью клиники окупают лицензию NovaHealth уже за первый месяц за счет привлечения дополнительных пациентов и сокращения ошибок первичного приема."
      }
    ]
  },
  {
    id: "example-cyberguard",
    title: "CyberGuard V2",
    subtitle: "Децентрализованный корпоративный сейф",
    idea: "Квантово-устойчивая система защиты учетных данных и корпоративного доступа",
    mode: "shark" as Mode,
    style: "cosmic-dark" as const,
    industry: "Cybersecurity / SaaS",
    description: "Бескомпромиссный продукт в сегменте кибербезопасности. Пример структуры для продажи сложных технических инновационных продуктов крупным холдингам.",
    slides: [
      {
        title: "CyberGuard: Квантовый Щит",
        subtitle: "Сверхзащищенный шлюз авторизации для крупного бизнеса",
        content: [
          "Архитектура: Децентрализованное хранение ключей без единой точки отказа",
          "Криптография: Квантово-устойчивые алгоритмы шифрования нового поколения",
          "Внедрение: Легкая интеграция SDK во внутренние системы за 15 минут",
          "Назначение: Защита от промышленного шпионажа и фишинговых атак сотрудников"
        ],
        type: "title" as const,
        sectionLabel: "🔐 Раздел 01 • Безопасность",
        speechScript: "CyberGuard закрывает важнейшую уязвимость современного бизнеса — человеческий фактор и компрометацию учетных записей. Наш безсерверный метод делает кражу сессий технически невозможной."
      },
      {
        title: "Технологическое Преимущество",
        subtitle: "Уникальная архитектура Zero-Knowledge Proof",
        content: [
          "Инновация: Сервера авторизации не знают ваших паролей и биометрии",
          "Фактор защиты: 3-факторная проверка с привязкой к физическому чипу в устройстве",
          "Скорость: Время отклика сетевого защищенного рукопожатия менее 45 мс",
          "Стандарты: Соответствие высшим международным регламентам SOC2"
        ],
        type: "solution" as const,
        sectionLabel: "🛡️ Раздел 02 • Технологии",
        speechScript: "Мы используем доказательства с нулевым разглашением. Даже если хакеры взломают наши сервера, они получат лишь зашифрованный шум без приватных ключей клиентов."
      },
      {
        title: "Рынок & Конкурентная Матрица",
        subtitle: "Почему крупные холдинги выбирают CyberGuard",
        content: [
          "Конкуренты: Популярные менеджеры хранят логины в уязвимом центральном облаке",
          "Рыночная ниша: Защита enterprise-сектора (банки, финтех, госкорпорации)",
          "Коммерциализация: Стоимость от $12 за одного сотрудника ежемесячно",
          "Результат: Защищено более 80,000 рабочих мест у первых 15 крупных клиентов"
        ],
        type: "competition" as const,
        sectionLabel: "🏆 Раздел 03 • Конкуренция",
        speechScript: "Традиционные менеджеры паролей регулярно взламывают. CyberGuard предлагает полностью распределенную концепцию. Наша экономика устойчива, а цена внедрения на 40% ниже аналогов."
      }
    ]
  },
  {
    id: "example-edusphere",
    title: "EduSphere MR",
    subtitle: "Иммерсивное обучение в школах",
    idea: "Платформа смешанной реальности для проведения интерактивных лабораторных работ в школах и вузах",
    mode: "quick" as Mode,
    style: "clean-light" as const,
    industry: "EdTech / Spatial",
    description: "Яркий и дружелюбный проект интерактивного образования. Демонстрирует швейцарский дизайн с чистым фоном и высоким контрастом.",
    slides: [
      {
        title: "EduSphere: Виртуальные Лаборатории",
        subtitle: "Трансформируем школьное образование с помощью дополненной реальности",
        content: [
          "Новый формат: Интерактивные физические и химические опыты в 3D",
          "Эффективность: Усвоение и запоминание материала повышается на 84%",
          "Безопасность: Проведение опасных реакций (радиация, взрывы) без риска",
          "Доступность: Поддержка любых недорогих VR-шлемов и мобильных устройств"
        ],
        type: "title" as const,
        sectionLabel: "🎓 Раздел 01 • Образование",
        speechScript: "С EduSphere школы могут забыть о замене дорогого оборудования в лабораториях. Все реактивы и приборы теперь доступны в невероятной детализации на экранах очков смешанной реальности."
      },
      {
        title: "Решение Проблемы Устаревших Классов",
        subtitle: "Современные инструменты для вовлечения поколения зумеров",
        content: [
          "Проблема школы: Оборудование пылится, реактивы заканчиваются, дети скучают",
          "Решение: 120 готовых полностью анимированных лабораторных сценариев по ФГОС",
          "Интерактивность: Возможность группового прохождения заданий в единой сессии",
          "Экономика: Экономия школы на закупке реального оборудования до $4,500/год"
        ],
        type: "solution" as const,
        sectionLabel: "📚 Раздел 02 • Лаборатория",
        speechScript: "Мы вовлекаем учеников в игровой форме, где они сами могут собирать атомные ядра или проводить гидролиз. Это оживляет скучные формулы из классических учебников."
      },
      {
        title: "Потенциал & Модель Дистрибуции",
        subtitle: "Быстрое масштабирование по образовательным учреждениям",
        content: [
          "Рынок сбыта: 24,000+ частных и государственных школ по всей стране",
          "Связки: Лицензии закупаются целыми классами в формате годовой подписки",
          "Партнерство: Совместные проекты с издательствами интерактивных учебников",
          "Рост: Планируемый выход на зарубежные рынки MENA и Азии к началу 2027 года"
        ],
        type: "market" as const,
        sectionLabel: "🌎 Раздел 03 • Перспективы",
        speechScript: "Наша бизнес-модель предполагает годовую подписку на школу. Команда имеет 12-летний опыт в EdTech и VR, что гарантирует уверенное исполнение плана разработки."
      }
    ]
  }
];

export default function App() {
  // Screen views: 'intro' | 'interview' | 'generating' | 'deck' | 'admin' | 'about' | 'plans'
  const [screen, setScreen] = useState<'intro' | 'interview' | 'generating' | 'deck' | 'admin' | 'about' | 'plans'>('intro');
  const [legalPage, setLegalPage] = useState<LegalPageId | null>(() => getLegalPageFromPath(window.location.pathname));
  
  // Custom design style and selection state
  const [selectedStyle, setSelectedStyle] = useState<'cobalt' | 'clean-light' | 'cosmic-dark'>('cobalt');
  const [isSelectingStyle, setIsSelectingStyle] = useState(false);
  
  // App states
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<Mode>("investor");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [canvas, setCanvas] = useState<PitchCanvas>(INITIAL_CANVAS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [investorSentiment, setInvestorSentiment] = useState<'skeptical' | 'bored' | 'intrigued' | 'impressed' | 'combative'>('skeptical');
  const [underlyingThoughts, setUnderlyingThoughts] = useState("Идея принята. Начинаю углублённый разбор проекта...");
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [roastActive, setRoastActive] = useState(false);
  const [roasted, setRoasted] = useState(false);
  
  const [isWatermarkRemoved, setIsWatermarkRemoved] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [sessionImages, setSessionImages] = useState<{ id: string; image: string; description: string }[]>([]);
  const [showImagePromptModal, setShowImagePromptModal] = useState(false);
  const [isRewritingSlide, setIsRewritingSlide] = useState(false);
  const [rewriteError, setRewriteError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSpeechSlide, setCopiedSpeechSlide] = useState<number | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [exportState, setExportState] = useState<{ type: 'pdf' | 'pptx', current: number, total: number } | null>(null);
  const [exportSlideIndex, setExportSlideIndex] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Custom smart percentage loading for beautiful loading feedback
  const [generationProgress, setGenerationProgress] = useState(0);

  const [activeAds, setActiveAds] = useState<any[]>([]);

  // --- New Database Authentication and Preserved Library States ---
  const [user, setUser] = useState<{
    id: number,
    email: string,
    name?: string | null,
    emailVerified?: boolean,
    role?: string,
    isPro?: boolean,
    plan?: string,
    planExpiresAt?: string | null,
    monthlyDeckCount?: number,
    monthlyDeckLimit?: number,
    monthlyDeckResetAt?: string | null,
  } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("decksy_token"));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Auth inputs
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authVerificationPending, setAuthVerificationPending] = useState(false);
  const [authVerificationCode, setAuthVerificationCode] = useState("");
  const [oauthProviders, setOauthProviders] = useState<{ id: string; label: string; enabled: boolean }[]>([]);
  const vkidContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setLegalPage(getLegalPageFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openGeneratorRoot = () => {
    setLegalPage(null);
    window.history.pushState({}, document.title, "/");
    setScreen("intro");
  };

  // Saved decks library
  const [savedDecks, setSavedDecks] = useState<any[]>([]);
  const [showLibraryDrawer, setShowLibraryDrawer] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [lastSavedDeckId, setLastSavedDeckId] = useState<string | null>(null);

  // Synchronize Auth Session on app load
  useEffect(() => {
    const checkUserSession = async () => {
      if (!authToken) {
        setUser(null);
        return;
      }
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsWatermarkRemoved(data.user.isPro || false);
        } else {
          // Token expired or invalid
          localStorage.removeItem("decksy_token");
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Session verification failed", err);
      }
    };
    checkUserSession();
  }, [authToken]);

  const fetchActiveAds = async () => {
    try {
      const response = await fetch("/api/ads/active");
      if (response.ok) {
        const data = await response.json();
        setActiveAds(data);
      }
    } catch (err) {
      console.warn("Failed to fetch active ads", err);
    }
  };

  useEffect(() => {
    fetchActiveAds();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("auth_error");
    if (oauthError) {
      setAuthError(oauthError);
      setShowAuthModal(true);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/oauth/providers")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (Array.isArray(data?.providers)) {
          setOauthProviders(data.providers);
        }
      })
      .catch((err) => console.warn("Failed to fetch OAuth providers", err));
  }, []);

  useEffect(() => {
    const vkEnabled = oauthProviders.some((provider) => provider.id === "vk" && provider.enabled);
    if (!showAuthModal || !vkEnabled || !vkidContainerRef.current) return;

    let cancelled = false;
    const scriptId = "vkid-sdk";

    const loadScript = () => new Promise<void>((resolve, reject) => {
      if ((window as any).VKIDSDK) {
        resolve();
        return;
      }

      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("VK ID SDK load failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@vkid/sdk@%3C3.0.0/dist-sdk/umd/index.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("VK ID SDK load failed"));
      document.head.appendChild(script);
    });

    loadScript()
      .then(() => {
        if (cancelled || !vkidContainerRef.current || !(window as any).VKIDSDK) return;

        const VKID = (window as any).VKIDSDK;
        vkidContainerRef.current.innerHTML = "";

        VKID.Config.init({
          app: 54642417,
          redirectUrl: "https://decksy.ru/api/auth/oauth/vk/callback",
          responseMode: VKID.ConfigResponseMode.Callback,
          source: VKID.ConfigSource.LOWCODE,
          scope: "email",
        });

        const oAuth = new VKID.OAuthList();
        oAuth.render({
          container: vkidContainerRef.current,
          oauthList: ["vkid", "mail_ru"],
        })
          .on(VKID.WidgetEvents.ERROR, (error: any) => {
            console.error("VK ID widget error", error);
            setAuthError("Не удалось открыть VK ID / Mail.ru вход.");
          })
          .on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, async (payload: any) => {
            try {
              setAuthLoading(true);
              setAuthError("");
              const data = await VKID.Auth.exchangeCode(payload.code, payload.device_id);
              const response = await fetch("/api/auth/oauth/vk-widget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              const result = await response.json();
              if (!response.ok) {
                throw new Error(result.error || "Не удалось войти через VK ID / Mail.ru.");
              }

              localStorage.setItem("decksy_token", result.token);
              setAuthToken(result.token);
              setUser(result.user);
              setIsWatermarkRemoved(result.user.isPro || false);
              setShowAuthModal(false);
            } catch (err: any) {
              console.error("VK ID auth failed", err);
              setAuthError(err.message || "Ошибка входа через VK ID / Mail.ru.");
            } finally {
              setAuthLoading(false);
            }
          });
      })
      .catch((err) => {
        console.error(err);
        setAuthError("Не удалось загрузить VK ID SDK.");
      });

    return () => {
      cancelled = true;
    };
  }, [showAuthModal, oauthProviders]);

  const handleSubscriptionChanged = async () => {
    if (authToken) {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsWatermarkRemoved(data.user.isPro || false);
        }
      } catch (err) {
        console.error("Failed to sync sub changes", err);
      }
    }
  };

  const fetchLibraryDecks = async () => {
    if (!authToken) return;
    setLibraryLoading(true);
    try {
      const response = await fetch("/api/decks", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedDecks(data);
      }
    } catch (err) {
      console.error("Failed to fetch saved decks", err);
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (user && authToken) {
      fetchLibraryDecks();
    } else {
      setSavedDecks([]);
    }
  }, [user, authToken]);

  const saveDeckToDatabase = async (deckToSave: PitchDeck, canvasToSave?: PitchCanvas) => {
    if (!authToken || !user) return;
    setSaveInProgress(true);
    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: deckToSave.id || `deck_${Date.now()}`,
          title: deckToSave.title,
          subtitle: deckToSave.subtitle || "",
          idea: deckToSave.idea,
          mode: deckToSave.mode,
          slides: deckToSave.slides,
          roast: deckToSave.roast,
          canvas: canvasToSave || canvas
        })
      });
      if (response.ok) {
        setLastSavedDeckId(deckToSave.id);
        fetchLibraryDecks(); // reload list
      }
    } catch (err) {
      console.error("Failed to save pitch deck to DB", err);
    } finally {
      setSaveInProgress(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthInfo("");
    setAuthLoading(true);

    const url = authTab === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = authTab === "login" 
      ? { email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword, name: authName };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || "Произошла ошибка при аутентификации.");
        return;
      }

      if (data.requiresEmailVerification) {
        setAuthVerificationPending(true);
        setAuthInfo(data.message || "Введите 6-значный код из письма, чтобы подтвердить email.");
        setAuthPassword("");
        return;
      }

      // Success
      localStorage.setItem("decksy_token", data.token);
      setAuthToken(data.token);
      setUser(data.user);
      setIsWatermarkRemoved(data.user.isPro || false);
      setShowAuthModal(false);
      
      // Clear forms
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
    } catch (err) {
      console.error(err);
      setAuthError("Сбой соединения с сервером.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setAuthError("");
    setAuthInfo("");
    if (!authEmail) {
      setAuthError("Введите email, чтобы отправить подтверждение повторно.");
      return;
    }
    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail })
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || "Не удалось отправить письмо подтверждения.");
        return;
      }
      setAuthVerificationPending(true);
      setAuthInfo(data.message || "Если аккаунт существует, код подтверждения отправлен.");
    } catch (err) {
      console.error(err);
      setAuthError("Сбой соединения с сервером.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    setAuthError("");
    setAuthInfo("");
    if (!authEmail || !/^\d{6}$/.test(authVerificationCode.trim())) {
      setAuthError("Введите email и 6-значный код из письма.");
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, code: authVerificationCode.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || "Не удалось подтвердить email.");
        return;
      }

      localStorage.setItem("decksy_token", data.token);
      setAuthToken(data.token);
      setUser(data.user);
      setIsWatermarkRemoved(data.user.isPro || false);
      setShowAuthModal(false);
      setAuthVerificationPending(false);
      setAuthVerificationCode("");
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
    } catch (err) {
      console.error(err);
      setAuthError("Сбой соединения с сервером.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (authToken) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      }).catch((err) => console.warn("Server logout failed", err));
    }
    localStorage.removeItem("decksy_token");
    setAuthToken(null);
    setUser(null);
    setIsWatermarkRemoved(false);
    setScreen('intro');
    setSavedDecks([]);
    setShowLibraryDrawer(false);
  };

  const loadSavedDeck = (saved: any) => {
    setIdea(saved.idea);
    setMode(saved.mode as Mode);
    setDeck(saved);
    if (saved.canvas) {
      setCanvas(saved.canvas);
    }
    setActiveSlideIndex(0);
    setScreen("deck");
    setShowLibraryDrawer(false);
  };

  const loadExampleDeck = (exDeck: typeof EXAMPLE_DECKS[0]) => {
    setIdea(exDeck.idea);
    setMode(exDeck.mode);
    setSelectedStyle(exDeck.style);
    
    // Construct a full PitchDeck with matching visual data
    const newDeck: PitchDeck = {
      id: exDeck.id + "_" + Date.now(),
      title: exDeck.title,
      subtitle: exDeck.subtitle,
      idea: exDeck.idea,
      mode: exDeck.mode,
      slides: exDeck.slides.map((s, idx) => ({
        ...s,
        type: s.type as any,
        visualData: {
          list: s.content.map((bullet, listIdx) => ({
            id: `pt_${idx}_${listIdx}`,
            text: bullet,
            highlight: listIdx === 0
          }))
        }
      })),
      roast: {
        score: 87,
        verdict: "STRIKING PROPOSAL",
        roastText: "Этот пример прекрасен, сбалансирован и готов к показу бизнес-ангелам. Вы можете изменить любой слайд под себя!",
        weakSpots: ["Требуется тонкая настройка под вашу локальную юрисдикцию"],
        recommendations: ["Адаптируйте финансовую модель под реальные показатели клиник"]
      }
    };
    
    setDeck(newDeck);
    setActiveSlideIndex(0);
    setScreen("deck");
  };

  const deleteSavedDeckSubmit = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading on container click
    if (!authToken) return;
    if (!confirm("Вы уверены, что хотите окончательно удалить презентацию из облака?")) return;

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        setSavedDecks(prev => prev.filter(d => d.id !== deckId));
      }
    } catch (err) {
      console.error("Failed to delete deck", err);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested ideas
  const suggestions = [
    "Сервис, который помогает битмейкерам продавать биты через ИИ-маркетинг",
    "ИИ-советник для автоматического аудита юридических контрактов и поиска скрытых рисков",
    "Платформа шеринга строительных инструментов по геолокации без залога",
    "Telegram-бот для автоматической транскрипции и саммари голосовых сообщений во встречах"
  ];

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Loading process visualizer helper
  useEffect(() => {
    if (screen !== 'generating') {
      setGenerationProgress(0);
      return;
    }
    setGenerationProgress(3);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev < 35) {
          return prev + Math.floor(Math.random() * 6) + 3;
        } else if (prev < 65) {
          return prev + Math.floor(Math.random() * 4) + 2;
        } else if (prev < 88) {
          return prev + Math.floor(Math.random() * 2) + 1;
        } else if (prev < 98) {
          return prev + (Math.random() > 0.6 ? 1 : 0);
        }
        return prev;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [screen]);

  // Max questions based on mode
  const getMaxQuestions = () => {
    if (mode === 'quick') return 3;
    if (mode === 'shark') return 6;
    return 5;
  };

  // Start interview handler
  const handleStartInterview = async () => {
    if (!idea.trim()) return;
    if (!authToken || !user) {
      setAuthError("Войдите или зарегистрируйтесь, чтобы общаться с ИИ и создавать презентации.");
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    setIsLoading(true);
    setScreen('interview');
    setCanvas(INITIAL_CANVAS);
    setSessionImages([]);
    setCurrentQuestionIndex(1);
    setInvestorSentiment('skeptical');
    setUnderlyingThoughts("Собираю факты для деки — задам несколько коротких вопросов.");
    
    const initialGreeting = `Привет! Идея: "${idea}". Чтобы быстрее собрать деку — отвечайте коротко, по пунктам (•).
Первый блок: кто ваш платящий клиент и какую боль решаете?`;

    const welcomeMsg: Message = {
      id: "init-question",
      sender: "investor",
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([welcomeMsg]);
    setIsLoading(false);
  };

  // Fast direct generation of Pitch Deck on any topic without interview
  const handleFastGenerateDeck = async (targetIdea: string) => {
    if (!authToken || !user) {
      setAuthError("Войдите или зарегистрируйтесь, чтобы общаться с ИИ и создавать презентации.");
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    const finalIdea = targetIdea.trim() || suggestions[1];
    setIdea(finalIdea);
    setIsLoading(true);
    setScreen('generating');

    try {
      const initialMessages: Message[] = [
        { id: "msg_init", sender: "investor" as const, text: `Мгновенная генерация слайдов для темы: "${finalIdea}"`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ];
      setMessages(initialMessages);

      const response = await fetch("/api/generate_deck", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          idea: finalIdea,
          mode,
          messages: initialMessages,
          canvas: INITIAL_CANVAS,
          sessionImages: []
        })
      });

      if (!response.ok) {
        throw new Error("Генерация питч-дека провалилась.");
      }

      const deckData = normalizeDeck(await response.json(), finalIdea, mode, INITIAL_CANVAS);
      setDeck(deckData);
      setActiveSlideIndex(0);
      setScreen('deck');
    } catch (err: any) {
      console.error(err);
      setDeck(generateLocalDeck(finalIdea, mode, INITIAL_CANVAS));
      setActiveSlideIndex(0);
      setScreen('deck');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to investor & get next question / canvas updates
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!authToken || !user) {
      setAuthError("Войдите или зарегистрируйтесь, чтобы общаться с ИИ и создавать презентации.");
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          idea,
          mode,
          messages: newMessages,
          canvas
        })
      });

      if (!response.ok) {
        throw new Error("Не удалось получить ответ инвестора.");
      }

      const data = await response.json();
      
      const investorMsg: Message = {
        id: `msg-${Date.now()}-investor`,
        sender: "investor",
        text: data.nextQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, investorMsg]);
      
      if (data.canvasUpdates) {
        setCanvas(data.canvasUpdates);
      }
      
      if (data.investorSentiment) {
        setInvestorSentiment(data.investorSentiment);
      }
      
      if (data.underlyingThoughts) {
        setUnderlyingThoughts(data.underlyingThoughts);
      }

      setCurrentQuestionIndex(prev => prev + 1);

      const userAnswers = newMessages.filter((m) => m.sender === "user").length;
      const interviewDone =
        data.interviewComplete === true ||
        userAnswers >= getMaxQuestions() ||
        isInterviewDoneMessage(data.nextQuestion || "");

      if (interviewDone) {
        setInputMessage("");
        setTimeout(() => {
          handleProceedToGeneration();
        }, 1200);
      }

    } catch (err: any) {
      console.error(err);
      // Fallback with visual notification
      const fallbackMsg: Message = {
        id: `msg-${Date.now()}-err`,
        sender: "investor",
        text: `Связь прервалась, но ответ записан. Продолжим: монетизация — модель и цена? Ответьте по пунктам (•).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const isInterviewDoneMessage = (text: string) =>
    /достаточно|автоматически соберу|соберу презентацию|интервью заверш|скачать файл pptx|поделиться ссылкой|разнести мой pitch/i.test(text);

  const runGenerateDeck = async () => {
    setIsLoading(true);
    setScreen("generating");

    try {
      const response = await fetch("/api/generate_deck", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ idea, mode, messages, canvas, sessionImages }),
      });

      if (!response.ok) {
        throw new Error("Генерация питч-дека провалилась.");
      }

      const deckData = normalizeDeck(await response.json(), idea, mode, canvas);
      setDeck(deckData);
      setActiveSlideIndex(0);
      setScreen("deck");
      if (authToken) {
        saveDeckToDatabase(deckData);
      }
    } catch (err: any) {
      console.error(err);
      const localDeck = generateLocalDeck(idea, mode, canvas);
      setDeck(localDeck);
      setActiveSlideIndex(0);
      setScreen("deck");
      if (authToken) {
        saveDeckToDatabase(localDeck);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToGeneration = () => {
    if (sessionImages.length === 0) {
      setShowImagePromptModal(true);
    } else {
      setIsSelectingStyle(true);
    }
  };

  const handleGenerateDeck = () => {
    if (!authToken || !user) {
      setAuthError("Войдите или зарегистрируйтесь, чтобы общаться с ИИ и создавать презентации.");
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    handleProceedToGeneration();
  };

  const updateSlide = (slideIndex: number, patch: Partial<Slide>) => {
    setDeck((prev) => {
      if (!prev) return prev;
      const slides = [...prev.slides];
      slides[slideIndex] = { ...slides[slideIndex], ...patch };
      const next = { ...prev, slides };
      if (patch.title && slideIndex === 0) {
        next.title = patch.title;
      }
      return next;
    });
  };

  const updateSlideBullets = (slideIndex: number, bullets: string[]) => {
    updateSlide(slideIndex, { content: bullets.filter((b) => b.trim()) });
  };

  const handleRewriteSlideWithAI = async (slideIndex: number, imageDescription: string) => {
    if (!deck) return;
    const currentSlide = deck.slides[slideIndex];
    if (!currentSlide) return;

    if (!authToken || !user) {
      setAuthError("Войдите или зарегистрируйтесь, чтобы общаться с ИИ и создавать презентации.");
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }

    setIsRewritingSlide(true);
    setRewriteError("");

    try {
      const response = await fetch("/api/rewrite_slide", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          slide: currentSlide,
          imageDescription,
          idea,
          mode
        })
      });

      if (!response.ok) {
        throw new Error("Не удалось переписать слайд под описание картинки.");
      }

      const data = await response.json();
      if (data.success && data.slide) {
        updateSlide(slideIndex, data.slide);
      } else {
        throw new Error(data.error || "Произошла ошибка при перегенерации слайда ИИ.");
      }
    } catch (err: any) {
      console.error(err);
      setRewriteError(err.message || "Не удалось переписать слайд через ИИ.");
    } finally {
      setIsRewritingSlide(false);
    }
  };

  // Run speech synthesis for the current slide
  const handleSpeakSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Ваш браузер не поддерживает озвучивание текста голосом.");
    }
  };

  // Copy speech text helper
  const handleCopySpeech = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSpeechSlide(index);
    setTimeout(() => setCopiedSpeechSlide(null), 3000);
  };

  // Helper to sequentially capture slides using the fixed active element to guarantee rendering accuracy
  const performSequentialCapture = async (type: 'pdf' | 'pptx'): Promise<string[]> => {
    if (!deck) return [];
    const images: string[] = [];
    const total = deck.slides.length || 10;
    
    // Enable on-the-fly mathematical conversion of modern oklch/oklab color expressions to RGB
    const restoreStylePatch = patchComputedStyle();
    
    try {
      for (let i = 0; i < total; i++) {
        // Step 1: Tell React to render this slide in the high-fidelity container
        setExportSlideIndex(i);
        setExportState({ type, current: i + 1, total });
        
        // Step 2: Allow React DOM to fully paint (double rAF + short delay)
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
        await new Promise((resolve) => setTimeout(resolve, 450));

        const element = document.getElementById("export-active-slide-node");
        if (!element) {
          throw new Error(`Не удалось найти контейнер экспорта slide-node для слайда ${i + 1}`);
        }

        const canvas = await html2canvas(element, getExportHtml2canvasOptions(element));
        const imgDataUrl = canvas.toDataURL("image/png");
        images.push(imgDataUrl);
      }
    } finally {
      // Safely tear down proxy patch when done to restore original getComputedStyle behavior
      restoreStylePatch();
    }
    
    return images;
  };

  // Gorgeous PDF Exporter (exactly matching visual design)
  const handleDownloadPDF = async () => {
    if (!deck) return;
    
    try {
      const images = await performSequentialCapture('pdf');
      if (images.length > 0) {
        exportImagesToPDF(images, deck.title);
      }
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Не удалось сгенерировать PDF: " + err);
    } finally {
      setExportState(null);
      setExportSlideIndex(null);
    }
  };

  // Gorgeous PPTX Exporter (snapshot based, 100% exact design)
  const handleDownloadPPTX = async () => {
    if (!deck) return;
    
    try {
      const images = await performSequentialCapture('pptx');
      if (images.length > 0) {
        exportImagesToPPTX(images, deck.title);
      }
    } catch (err) {
      console.error("Failed to export PPTX:", err);
      // Fallback to text exporter if something fails
      exportToPPTX(deck, { removeWatermark: isWatermarkRemoved });
    } finally {
      setExportState(null);
      setExportSlideIndex(null);
    }
  };

  // 100% reliable alternative format: Download JPEGs inside a ZIP file
  const handleDownloadZIP = async () => {
    if (!deck) return;
    
    try {
      const images = await performSequentialCapture('pptx'); // uses high-fidelity capture
      if (images.length > 0) {
        await downloadSlidesAsZIP(images, deck.title);
      }
    } catch (err) {
      console.error("Failed to export ZIP:", err);
      alert("Не удалось сгенерировать ZIP архив картинок: " + err);
    } finally {
      setExportState(null);
      setExportSlideIndex(null);
    }
  };

  // Download runnable python-pptx presentation generation code
  const handleDownloadPythonScript = () => {
    if (!deck) return;
    try {
      const pythonCode = generatePythonPPTXCode(deck);
      const blob = new Blob([pythonCode], { type: "text/x-python;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "generate_pitch_presentation.py";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate Python script:", err);
      alert("Не удалось сгенерировать Python скрипт: " + err);
    }
  };

  // Share Pitch Dialog
  const handleShareDeck = () => {
    setShareSuccess(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => {
      setShareSuccess(false);
    }, 4000);
  };

  // Reset states to restart
  const handleReset = () => {
    setScreen('intro');
    setIdea("");
    setMessages([]);
    setCanvas(INITIAL_CANVAS);
    setSessionImages([]);
    setDeck(null);
    setRoastActive(false);
    setRoasted(false);
  };

  const getSentimentStyling = (sentiment: string) => {
    switch (sentiment) {
      case "impressed":
        return { bg: "bg-emerald-950/20 border-emerald-500/30 text-emerald-400", label: "Впечатлен 📈" };
      case "intrigued":
        return { bg: "bg-white/5 border-white/20 text-white", label: "Заинтригован 💡" };
      case "bored":
        return { bg: "bg-white/5 border-white/10 text-slate-500", label: "Скучает 🥱" };
      case "combative":
        return { bg: "bg-red-950/20 border-red-500/30 text-red-500", label: "Агрессивно критичен 🦈" };
      default:
        return { bg: "bg-amber-950/20 border-amber-500/30 text-amber-500", label: "Скептический 🤨" };
    }
  };

  const currentSentiment = getSentimentStyling(investorSentiment);

  const getThemeStyles = (slideIndex: number, type: string) => {
    return getThemeStylesShared(slideIndex, type, selectedStyle);
  };

  // Dynamic iOS Apple-style slide content renderer with bento blocks and pristine typography
  const renderSlideContent = (
    slide: Slide,
    index: number,
    forExport = false,
    onUpdate?: (patch: Partial<Slide>) => void
  ) => {
    return (
      <SlideRenderer
        slide={slide}
        index={index}
        selectedStyle={selectedStyle}
        forExport={forExport}
        onUpdate={onUpdate}
      />
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const LEGACY_renderSlideContent_UNUSED = (
    slide: Slide,
    index: number,
    forExport = false,
    onUpdate?: (patch: Partial<Slide>) => void
  ) => {
    if (!slide) return null;

    const title = slide.title;
    const subtitle = slide.subtitle;
    const content = slide.content || [];
    const type = (slide.type || "") as string;
    const editable = !!onUpdate && !forExport;
    const theme = getThemeStyles(index, type);

    const T = (text: string, field: "title" | "subtitle" | "badge" | "sectionLabel", className: string, Tag: React.ElementType = "span") =>
      editable ? (
        <EditableText value={text} className={className} as={Tag} onSave={(v) => onUpdate!({ [field]: v })} />
      ) : (
        <Tag className={className}>{text}</Tag>
      );

    const B = (text: string, bulletIndex: number, className: string, Tag: React.ElementType = "span") =>
      editable ? (
        <EditableText
          value={text}
          className={className}
          as={Tag}
          onSave={(v) => {
            const next = [...content];
            next[bulletIndex] = v;
            onUpdate!({ content: next });
          }}
        />
      ) : (
        <Tag className={className}>{text}</Tag>
      );

    // Helper to parse double part labels like "TAM: $40B" or "Key - Value"
    const parseBullet = (str: string) => {
      const splitters = [": ", " — ", " - "];
      for (const splitter of splitters) {
        if (str.includes(splitter)) {
          const idx = str.indexOf(splitter);
          const first = str.substring(0, idx).trim();
          const second = str.substring(idx + splitter.length).trim();
          return { label: first, detail: second };
        }
      }
      return { label: "", detail: str };
    };

    // Helper to parse numbers
    const extractNumber = (str: string) => {
      const match = str.match(/(\$?\d+[,.]?\d*\s*(?:миллиард\w*|млн|тыс|%|B|M|K|млрд| доллар\w*|к\b|к\s))/i);
      return match ? match[1] : "";
    };

    // 1. TITLE SLIDE (Index 0 or type === 'title')
    if (index === 0 || type === "title") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      
      const firstLetter = (title || "A").trim().charAt(0).toUpperCase();
      let logoMarkBg = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      let logoMarkColor = "text-white";
      let logoMarkShadow = "shadow-[0_12px_30px_rgba(16,185,129,0.25)]";
      if (isLight) {
        logoMarkBg = "linear-gradient(135deg, #111115 0%, #1a1a20 100%)";
        logoMarkColor = "text-white";
        logoMarkShadow = "shadow-[0_12px_24px_rgba(0,0,0,0.15)]";
      } else if (isCobalt) {
        logoMarkBg = "linear-gradient(135deg, #0071e3 0%, #004bc2 100%)";
        logoMarkColor = "text-white";
        logoMarkShadow = "shadow-[0_12px_30px_rgba(0,113,227,0.3)]";
      }

      return (
        <div className="flex flex-col justify-between h-full py-1 text-center font-sans">
          {/* SQUIRCLE BRAND MARK FROM APEX TEMPLATE */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-extrabold tracking-tighter ${logoMarkColor} ${logoMarkShadow} border border-white/5`}
              style={{ background: logoMarkBg }}
            >
              {firstLetter}
            </div>
          </div>

          <div
            className="mx-auto inline-flex items-center space-x-1.5 border px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono text-[9px]"
            style={{
              background: isLight ? "rgba(0,0,0,0.03)" : isCobalt ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              borderColor: isLight ? "rgba(0,0,0,0.08)" : isCobalt ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)5",
              color: isLight ? "#004de6" : isCobalt ? "#9bf0e1" : "#9bf0e1",
            }}
          >
            <span className={`h-1 w-1 rounded-full ${isLight ? 'bg-blue-600' : 'bg-[#10b981]'}`} style={forExport ? { animation: "none" } : undefined}></span>
            {T(slide.badge || "✦ SERIES B INVESTOR DECK", "badge", "", "span")}
          </div>

          <div className="space-y-2.5 my-auto">
            {T(
              title,
              "title",
              (isLight ? "text-neutral-900 font-extrabold" : isCobalt ? "text-white font-black" : "text-white font-black") + 
              " tracking-tighter uppercase leading-none font-display " + 
              (forExport ? "text-5xl" : "text-lg sm:text-2xl md:text-3xl lg:text-4xl"),
              "h1"
            )}
            {subtitle && T(
              subtitle,
              "subtitle",
              (isLight ? "text-neutral-500" : isCobalt ? "text-blue-105" : "text-slate-400") + 
              " font-medium font-sans max-w-xl mx-auto tracking-normal " + 
              (forExport ? "text-base" : "text-xs sm:text-sm"),
              "p"
            )}
          </div>

          {/* DENSE HORIZONTAL BENTO CARD SPLIT FOR CATEGORIES */}
          <div className="grid grid-cols-3 gap-2 border-t pt-2" style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : isCobalt ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)" }}>
            {slide.image ? (
              <>
                {content.slice(0, 2).map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-1.5 text-center border text-left flex flex-col justify-between"
                    style={{
                      background: isLight ? "rgba(0,0,0,0.01)" : isCobalt ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                      borderColor: isLight ? "rgba(0,0,0,0.05)" : isCobalt ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <span className={`block uppercase tracking-wider font-mono ${isLight ? 'text-neutral-450' : 'text-slate-550'}`} style={{ fontSize: "7px" }}>
                      Презентация {i + 1}
                    </span>
                    {B(
                      item,
                      i,
                      `block font-sans font-medium text-[9px] sm:text-[10px] leading-tight mt-0.5 ${isLight ? 'text-neutral-800' : isCobalt ? 'text-white' : 'text-slate-300'}`,
                      "span"
                    )}
                  </div>
                ))}
                <div 
                  className="rounded-lg overflow-hidden border relative flex flex-col justify-between bg-black/20 h-[50px] md:h-auto min-h-[40px]"
                  style={{
                    borderColor: isLight ? "rgba(0,0,0,0.08)" : isCobalt ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"
                  }}
                >
                  <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Image"} />
                  {slide.imageDescription && (
                    <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                      {slide.imageDescription}
                    </div>
                  )}
                </div>
              </>
            ) : (
              content.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg p-1.5 text-center border text-left flex flex-col justify-between"
                  style={{
                    background: isLight ? "rgba(0,0,0,0.01)" : isCobalt ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                    borderColor: isLight ? "rgba(0,0,0,0.05)" : isCobalt ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  <span className={`block uppercase tracking-wider font-mono ${isLight ? 'text-neutral-450' : 'text-slate-550'}`} style={{ fontSize: "7px" }}>
                    Раздел 0{i + 1}
                  </span>
                  {B(
                    item,
                    i,
                    `block font-sans font-medium text-[9px] sm:text-[10px] leading-tight mt-0.5 ${isLight ? 'text-neutral-800' : isCobalt ? 'text-white' : 'text-slate-300'}`,
                    "span"
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // 2. PROBLEM SLIDE (Index 1 or type === 'problem')
    if (index === 1 || type === "problem") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-between h-full py-1">
          <div className="flex items-center justify-between border-b pb-1.5 text-left" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : isCobalt ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "🎯 РАЗДЕЛ 02 • АНАЛИЗ ПРОБЛЕМЫ", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-rose-600' : 'text-rose-400'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-md font-extrabold tracking-tight uppercase leading-none font-display ${theme.titleColor}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[7px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`
            )}
          </div>

          {/* iOS block layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-auto">
            <div className={`rounded-xl p-3 flex flex-col justify-between text-left space-y-2 border ${isLight ? 'bg-rose-50/40 border-rose-200/50 text-neutral-850 shadow-sm' : isCobalt ? 'bg-rose-50/50 border-rose-200/50 text-slate-850' : 'bg-[#ff453a]/5 border border-[#ff453a]/15 text-red-105'}`}>
              <div className="flex items-center space-x-1.5">
                <div className={`h-5 w-5 rounded-lg flex items-center justify-center border ${isLight ? 'bg-rose-50 text-rose-600 border-rose-200/60' : 'bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/25'}`}>
                  <Flame className="h-3 w-3" />
                </div>
                <span className={`text-[8px] font-mono uppercase tracking-wider font-extrabold ${isLight ? 'text-rose-850' : 'text-white'}`}>Главный Фактор Боли</span>
              </div>
              <p className={`text-[10px] sm:text-[11px] leading-snug font-sans ${isLight ? 'text-neutral-700 font-medium' : isCobalt ? 'text-slate-800 font-medium' : 'text-rose-200/90'}`}>
                {content[0] || "Острая неудовлетворенность текущим пользовательским опытом."}
              </p>
            </div>

            {slide.image ? (
              <div className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20 h-[100px] md:h-auto min-h-[50px]">
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Problem Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col justify-center">
                {content.slice(1, 4).map((item, i) => {
                  const parsed = parseBullet(item);
                  return (
                    <div key={i} className={`rounded-lg p-2 flex items-start gap-2 text-left border ${isLight ? 'bg-neutral-50/50 border-neutral-200/50 text-neutral-850' : isCobalt ? 'bg-white border-blue-105 text-slate-850 shadow-sm' : 'bg-white/[0.015] border border-white/5 text-slate-350'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 flex-shrink-0"></span>
                      <p className="text-[9.5px] leading-snug font-sans">
                        {parsed.label ? <strong className={`font-bold ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}: </strong> : null}
                        <span className={`${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-350'}`}>{parsed.detail}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'} border-t pt-1`} style={{ borderColor: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)" }}>
            * Подтверждено проверенными когортными исследованиями и аналитикой активности пользователей.
          </p>
        </div>
      );
    }

    // 3. SOLUTION SLIDE (Index 2 or type === 'solution')
    if (index === 2 || type === "solution") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-between h-full py-1">
          <div className="flex items-center justify-between border-b pb-1.5 text-left" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : isCobalt ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "🚀 РАЗДЕЛ 03 • НАШЕ РЕШЕНИЕ", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-emerald-500' : 'text-[#10b981]'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-md font-extrabold tracking-tight uppercase leading-none font-display ${theme.titleColor}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[7px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'}`
            )}
          </div>

          {/* Minimal tidy row blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-auto">
            {content.slice(0, slide.image ? 2 : 3).map((item, i) => {
              const parsed = parseBullet(item);
              return (
                <div key={i} className={`rounded-xl p-3 text-left transition-all flex flex-col justify-between space-y-2 border ${
                  isLight 
                    ? 'bg-white border-neutral-200 shadow-sm hover:border-neutral-300' 
                    : isCobalt 
                      ? 'bg-white border-blue-105 shadow-sm shadow-blue-500/5 hover:border-blue-200' 
                      : 'bg-gradient-to-b from-white/[0.025] to-white/[0.012] hover:from-white/[0.04] border border-white/5 hover:border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`h-5 w-5 rounded-lg flex items-center justify-center border ${isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-[#10b981]/10 text-emerald-450 border border-emerald-500/20'}`}>
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <span className={`text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-neutral-450' : 'text-slate-500'}`}>Компонент 0{i+1}</span>
                  </div>
                  <div>
                    {parsed.label ? (
                      <h4 className={`text-[9.5px] font-display font-black uppercase tracking-tight mb-0.5 ${isLight ? 'text-neutral-950' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}</h4>
                    ) : null}
                    <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-350'}`}>
                      {parsed.detail}
                    </p>
                  </div>
                </div>
              );
            })}
            {slide.image && (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
                style={{ minHeight: '80px', height: '100%' }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Solution Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`flex items-center space-x-2 border p-1.5 rounded-lg text-left ${isLight ? 'bg-emerald-50/20 border-emerald-200/50' : 'bg-[#10b981]/5 border border-[#10b981]/15'}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
            <span className={`text-[8.5px] tracking-wide font-sans truncate ${isLight ? 'text-neutral-700 font-medium' : 'text-emerald-300'}`}>Инновационный технологический подход заменяет недели сложной мануальной настройки.</span>
          </div>
        </div>
      );
    }

    // 4. MARKET SIZE (Index 3 or type === 'market')
    if (index === 3 || type === "market") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-between h-full py-1">
          <div className="flex items-center justify-between border-b pb-1.5 text-left" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : isCobalt ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "👥 РАЗДЕЛ 04 • ЦЕЛЕВОЙ РЫНОК", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-blue-600' : 'text-[#3b82f6]'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-md font-extrabold tracking-tight uppercase leading-none font-display ${theme.titleColor}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[7px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : isCobalt ? 'bg-blue-500/10 text-[#004de6] border-blue-200' : 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20'}`
            )}
          </div>

          {/* Elegant bento stats block */}
          <div className="grid grid-cols-3 gap-3 my-auto">
            {content.slice(0, slide.image ? 2 : 3).map((item, i) => {
              const parsed = parseBullet(item);
              const extractedNum = extractNumber(item);
              const labelText = parsed.label || `Сегмент 0${i + 1}`;
              const descText = parsed.detail || item;

              // Color configuration based on theme and index
              let cardBg = isLight 
                ? 'bg-white border-neutral-200 shadow-sm hover:border-neutral-300' 
                : isCobalt 
                  ? 'bg-white border-blue-105 shadow-sm shadow-blue-500/5 hover:border-blue-200' 
                  : 'bg-gradient-to-b from-white/[0.025] to-white/[0.012] border-white/5 hover:border-white/10';
              let accentColor = [
                { pill: isLight ? "bg-blue-50 text-blue-750 border-blue-150" : "bg-blue-500/10 text-blue-400 border-blue-500/20", num: isLight ? "text-blue-700" : isCobalt ? "text-[#004de6]" : "text-blue-400" },
                { pill: isLight ? "bg-indigo-50 text-indigo-750 border-indigo-150" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", num: isLight ? "text-indigo-700" : isCobalt ? "text-indigo-600" : "text-indigo-400" },
                { pill: isLight ? "bg-sky-50 text-sky-750 border-sky-150" : "bg-sky-500/10 text-sky-450 border-sky-500/20", num: isLight ? "text-sky-700" : isCobalt ? "text-sky-600" : "text-sky-400" }
              ][i] || { pill: "bg-white/5 text-white/80 border-white/10", num: "text-white" };

              return (
                <div key={i} className={`rounded-xl p-3 text-left flex flex-col justify-between space-y-2 relative overflow-hidden transition-all border ${cardBg}`}>
                  <div className="flex items-center justify-between relative z-10">
                    <span className={`text-[7.5px] font-mono py-0.5 px-1.5 rounded uppercase tracking-widest font-extrabold border ${accentColor.pill}`}>
                      {labelText}
                    </span>
                    <span className={`text-[7.5px] font-mono ${isLight ? 'text-neutral-450' : 'text-slate-500'}`}>0{i+1}</span>
                  </div>
                  
                  <div className="space-y-1 relative z-10">
                    {extractedNum ? (
                      <div className={`text-md sm:text-lg md:text-xl font-display font-black tracking-tighter ${accentColor.num}`}>
                        {extractedNum}
                      </div>
                    ) : null}
                    <p className={`text-[9.5px] leading-snug font-sans line-clamp-3 ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-350'}`}>
                      {extractedNum ? descText.replace(extractedNum, "").replace(/^[:-]\s*/, "").trim() : descText}
                    </p>
                  </div>

                  {/* Decorative structural background badge */}
                  <div className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full opacity-[0.03] bg-current pointer-events-none" style={{ color: isLight ? '#004de6' : '#10b981' }}></div>
                </div>
              );
            })}
            {slide.image && (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
                style={{ minHeight: '80px', height: '100%' }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Market Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          {content[3] ? (
            <div className={`text-[9.5px] border-t pt-1.5 flex items-center justify-between ${isLight ? 'border-neutral-200 text-neutral-600' : isCobalt ? 'border-blue-105 text-slate-600' : 'border-white/5 text-slate-400'}`}>
              <span className={`font-mono text-[7.5px] uppercase tracking-wider font-extrabold ${isLight ? 'text-blue-600' : 'text-indigo-400'}`}>🔥 ТРЕНДЫ РЫНКА:</span>
              <span className="italic block truncate max-w-lg text-right font-medium">{content[3]}</span>
            </div>
          ) : (
            <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'} border-t pt-1.5`} style={{ borderColor: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)" }}>
              * TAM и SAM рассчитываются на основе отраслевой аналитики по нашему цифровому сектору.
            </p>
          )}
        </div>
      );
    }

    // 5. BUSINESS MODEL / REVENUE (Index 4 or type === 'pricing' || type === 'revenue')
    if (index === 4 || type === "pricing" || type === "revenue") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-around h-full py-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "💵 Раздел 05 • Бизнес-модель", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-amber-600' : 'text-amber-450 text-amber-400'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-auto">
            {content.slice(0, slide.image ? 2 : 3).map((item, i) => {
              const parsed = parseBullet(item);
              const extractedNum = extractNumber(item);

              // Apple pricing package style template
              const isHighlight = i === 1; // highlight middle plan as popular
              let cardClass = "";
              if (isLight) {
                cardClass = isHighlight 
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100/30 border-amber-300 shadow-md ring-2 ring-amber-500/10' 
                  : 'bg-white border-neutral-200 shadow-sm';
              } else if (isCobalt) {
                cardClass = isHighlight 
                  ? 'bg-blue-50/55 border-blue-400 shadow-md ring-2 ring-blue-500/10 text-slate-850'
                  : 'bg-white border-blue-100 shadow-sm text-slate-850';
              } else {
                cardClass = isHighlight 
                  ? 'bg-amber-500/[0.04] border-amber-500/40 shadow-inner' 
                  : 'bg-white/[0.02] border-white/5 text-slate-350';
              }

              return (
                <div key={i} className={`rounded-xl p-2.5 text-left flex flex-col justify-between space-y-2 relative overflow-hidden transition-all border ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-neutral-400' : 'text-slate-550 text-slate-500'}`}>Тариф 0{i+1}</span>
                    {isHighlight && (
                      <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[6px] px-1.5 py-0.5 font-bold uppercase rounded-full tracking-widest border border-amber-500/30">
                        ФОКУС
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className={`text-[9px] sm:text-[10px] font-display font-black uppercase tracking-tight truncate ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`}>
                      {parsed.label || "Подписка"}
                    </h4>
                    
                    {extractedNum ? (
                      <div className={`text-sm sm:text-base font-display font-extrabold tracking-tight mt-0.5 ${isLight ? 'text-neutral-900' : isCobalt ? 'text-[#004de6]' : 'text-amber-450 text-amber-400'}`}>
                        {extractedNum}
                      </div>
                    ) : null}
                  </div>

                  <p className={`text-[8px] sm:text-[9px] leading-tight font-sans min-h-[24px] line-clamp-2 ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-600' : 'text-slate-400'}`}>
                    {extractedNum ? parsed.detail.replace(extractedNum, "").trim() : parsed.detail}
                  </p>
                </div>
              );
            })}
            {slide.image && (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
                style={{ minHeight: '80px', height: '100%' }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Pricing Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          {content[3] ? (
            <div className={`border p-1.5 rounded-lg flex justify-between items-center text-[8px] ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800' : isCobalt ? 'bg-blue-50/40 border-blue-100 text-slate-800' : 'bg-white/[0.02] border-white/5 text-slate-350'}`}>
              <span className={`font-mono uppercase tracking-wider font-extrabold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>ЭКОНОМИКА UNIT:</span>
              <span className="font-medium">{content[3]}</span>
            </div>
          ) : (
            <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>* Прогнозируемая рентабельность проекта на горизонте 12 месяцев превышает 74%.</p>
          )}
        </div>
      );
    }

    // 6. SECRET SAUCE / TECH (Index 5 or type === 'sauce' || type === 'tech')
    if (index === 5 || type === "sauce" || type === "tech") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-around h-full py-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "🛡️ Раздел 06 • Технологический Moat", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-purple-600' : 'text-purple-400'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-auto">
            <div className={`rounded-xl p-3 flex flex-col justify-between space-y-1.5 text-left border relative overflow-hidden ${
              isLight 
                ? 'bg-gradient-to-br from-purple-50 to-indigo-50/50 border-purple-200 shadow-sm' 
                : isCobalt 
                  ? 'bg-blue-50/60 border-blue-200 shadow-sm' 
                  : 'bg-purple-500/[0.04] border-purple-500/20'
            }`}>
              <div className="flex items-center space-x-1.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${isLight ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-400 border-purple-500/25'}`}>
                  <LockKeyhole className="h-2.5 w-2.5" />
                </div>
                <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold ${isLight ? 'text-purple-800' : isCobalt ? 'text-slate-900' : 'text-white/90'}`}>Уникальный Барьер</span>
              </div>
              <p className={`text-[10px] md:text-[11px] leading-relaxed font-sans font-medium ${isLight ? 'text-purple-950' : isCobalt ? 'text-slate-800' : 'text-purple-200/90'}`}>
                {content[2] || content[0] || "Машинное обучение и собственные алгоритмы обеспечивают долгосрочные технологические преимущества."}
              </p>
            </div>

            {slide.image ? (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/10 h-full min-h-[90px]"
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Sauce Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col justify-center">
                {content.slice(0, 2).map((item, i) => {
                  const parsed = parseBullet(item);
                  return (
                    <div key={i} className={`rounded-xl p-2.5 flex items-start gap-2 text-left border ${
                      isLight 
                        ? 'bg-white border-neutral-200 shadow-none' 
                        : isCobalt 
                          ? 'bg-white border-blue-100 shadow-none text-slate-800' 
                          : 'bg-white/[0.012] border-white/5'
                    }`}>
                      <span className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${isLight ? 'bg-purple-600' : 'bg-purple-500'}`}></span>
                      <div className="space-y-0.5">
                        {parsed.label ? (
                          <h4 className={`text-[8.5px] font-extrabold uppercase font-mono ${isLight ? 'text-purple-700' : isCobalt ? 'text-slate-900' : 'text-slate-300'}`}>{parsed.label}</h4>
                        ) : null}
                        <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-400'}`}>
                          {parsed.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
            * Наша интеллектуальная собственность (IP) защищена многолетними научными исследованиями и R&D заделом.
          </p>
        </div>
      );
    }

    // 7. COMPETITORS SLIDE (Index 6 or type === 'competition')
    if (index === 6 || type === "competition") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-around h-full py-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "🥊 Раздел 07 • Конкурентный анализ", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-rose-600' : 'text-[#f43f5e]'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'}`
            )}
          </div>

          {/* Clean 2-block side-by-side positioning layout */}
          <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5 my-auto`}>
            <div className={`rounded-xl p-3 space-y-1.5 text-left border ${
              isLight 
                ? 'bg-rose-50/30 border-rose-100 shadow-sm' 
                : isCobalt 
                  ? 'bg-rose-100/10 border-rose-200 shadow-sm text-slate-800' 
                  : 'bg-white/[0.01] border-white/5'
            }`}>
              <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-rose-700' : 'text-[#f43f5e]'}`}>Другие Игроки (Слабости)</span>
              <ul className="space-y-1">
                {content.slice(0, 2).map((item, i) => (
                  <li key={i} className={`flex items-start text-[9.5px] font-sans leading-tight ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-700' : 'text-slate-400'}`}>
                    <span className="text-[#f43f5e] mr-2 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`rounded-xl p-3 space-y-1.5 text-left relative overflow-hidden border ${
              isLight 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : isCobalt 
                  ? 'bg-emerald-50 border-emerald-200 text-slate-800 shadow-sm shadow-emerald-100' 
                  : 'bg-emerald-500/[0.012] border-emerald-500/20'
            }`}>
              <div className="absolute top-0 right-0 h-12 w-12 bg-emerald-500/5 rounded-full blur-xl"></div>
              <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-600'}`}>Наш Продукт (Преимущество)</span>
              <ul className="space-y-1">
                {content.slice(2, 4).map((item, i) => (
                  <li key={i} className={`flex items-start text-[9.5px] font-sans leading-tight ${isLight ? 'text-neutral-700 font-medium' : isCobalt ? 'text-slate-800 font-medium' : 'text-emerald-200'}`}>
                    <span className="text-[#10b981] mr-1.5 mt-0.5">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {slide.image && (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
                style={{ minHeight: '80px', height: '100%' }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Competition Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
            * Фокус на узкой автоматизации позволяет сократить CAC и повысить удержание пользователей.
          </p>
        </div>
      );
    }

    // 8. GO-TO-MARKET / LAUNCH (Index 7 or type === 'launch' || type === 'gtm')
    if (index === 7 || type === "launch" || type === "gtm") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-around h-full py-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "🚀 Раздел 08 • Выход на Рынок (GTM)", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`
            )}
          </div>

          {/* Stepped layout pipeline flow */}
          <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-2 my-auto`}>
            {content.slice(0, slide.image ? 2 : 4).map((item, i) => {
              const parsed = parseBullet(item);
              let cardBg = "";
              if (isLight) {
                cardBg = 'bg-gradient-to-b from-white to-slate-50 border-neutral-200 shadow-sm';
              } else if (isCobalt) {
                cardBg = 'bg-white border-blue-100 shadow-sm shadow-blue-500/5';
              } else {
                cardBg = 'bg-white/[0.02] hover:bg-white/[0.03] border-white/5';
              }

              return (
                <div key={i} className={`border rounded-xl p-2.5 text-left relative flex flex-col justify-between space-y-1.5 transition-all ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`h-4.5 w-4.5 rounded-full text-[8.5px] font-mono font-bold flex items-center justify-center border ${
                      isLight 
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                        : isCobalt 
                          ? 'bg-blue-50 text-[#004de6] border-blue-150' 
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {i+1}
                    </span>
                    <span className={`text-[7px] font-mono ${isLight ? 'text-neutral-400 font-bold' : 'text-slate-550'}`}>ЭТАП</span>
                  </div>

                  <div>
                    {parsed.label ? (
                      <h4 className={`text-[8.5px] font-display font-bold uppercase truncate mb-0.5 ${isLight ? 'text-cyan-800' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}</h4>
                    ) : null}
                    <p className={`text-[9.5px] leading-snug font-sans line-clamp-3 ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-400'}`}>
                      {parsed.detail}
                    </p>
                  </div>
                </div>
              );
            })}
            {slide.image && (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
                style={{ minHeight: '80px', height: '100%' }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "GTM Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
            * Фокус на виральности и органическом привлечении обеспечивает околонулевой бюджет на старте.
          </p>
        </div>
      );
    }

    // 9. CRITICAL RISKS (Index 8 or type === 'risks')
    if (index === 8 || type === "risks") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-around h-full py-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "⚡ Раздел 09 • Анализ Рисков", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-amber-600' : 'text-amber-500'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`
            )}
          </div>

          {/* Balanced risk mapping */}
          <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5 my-auto`}>
            {content.slice(0, 2).map((item, i) => {
              const parsed = parseBullet(item);
              let cardBg = "";
              if (isLight) {
                cardBg = 'bg-white border-neutral-200 shadow-sm';
              } else if (isCobalt) {
                cardBg = 'bg-white border-blue-100 shadow-sm shadow-blue-500/5';
              } else {
                cardBg = 'bg-white/[0.012] border-white/5';
              }

              return (
                <div key={i} className={`border rounded-xl p-3 text-left flex flex-col justify-between space-y-1.5 relative overflow-hidden transition-all ${cardBg}`}>
                  <div className="flex items-center space-x-1.5 relative z-10">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span className={`text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>АНАЛИЗ РИСКА 0{i+1}</span>
                  </div>
                  
                  <div className="relative z-10">
                    {parsed.label ? (
                      <h4 className={`text-[9.5px] font-display font-bold uppercase tracking-tight mb-0.5 ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}</h4>
                    ) : null}
                    <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-400'}`}>
                      {parsed.detail}
                    </p>
                  </div>
                </div>
              );
            })}
            {slide.image && (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
                style={{ minHeight: '80px', height: '100%' }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Risks Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          {content[2] ? (
            <div className={`border p-2 rounded-lg text-left text-[9px] font-medium ${isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : isCobalt ? 'bg-blue-50/50 border-blue-100 text-slate-850' : 'bg-amber-955/15 border-amber-500/15 text-amber-300 bg-amber-950/10'}`}>
              💡 {content[2]}
            </div>
          ) : (
            <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
              * Систематическая проработка рисков обеспечивает юридическую и технологическую безопасность.
            </p>
          )}
        </div>
      );
    }

    // 10. THE ASK / FUNDING (Index 9 or type === 'ask' || type === 'cta')
    if (index === 9 || type === "ask" || type === "cta") {
      const isLight = selectedStyle === 'clean-light';
      const isCobalt = selectedStyle === 'cobalt';
      return (
        <div className="flex flex-col justify-around h-full py-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {T(slide.sectionLabel || "🎯 Раздел 10 • Инвестиционное Предложение", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-450 text-emerald-400'}`)}
              {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
            </div>
            {subtitle && T(
              subtitle,
              "subtitle",
              `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'}`
            )}
          </div>

          {/* Giant Focus block in Apple Style */}
          <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5 my-auto`}>
            <div className={`border rounded-xl p-3 flex flex-col justify-between text-left space-y-1.5 my-auto relative overflow-hidden ${
              isLight 
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm' 
                : isCobalt 
                  ? 'bg-emerald-50 border-emerald-200 text-slate-800 shadow-sm shadow-[#0a0a0b]/10' 
                  : 'bg-gradient-to-br from-emerald-500/[0.05] to-teal-500/[0.1] border-emerald-500/20'
            }`}>
              <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-400/5 rounded-full blur-xl"></div>
              <div>
                <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-emerald-800' : isCobalt ? 'text-slate-500' : 'text-white/50'}`}>Раунд Финансирования</span>
                <span className={`block text-base sm:text-lg font-display font-black tracking-tighter uppercase mt-0.5 ${isLight ? 'text-emerald-950' : isCobalt ? 'text-emerald-800' : 'text-white'}`}>Pre-Seed / Seed</span>
              </div>
              <p className={`text-[10px] sm:text-[10.5px] leading-snug font-sans font-medium ${isLight ? 'text-emerald-950' : isCobalt ? 'text-emerald-800' : 'text-white'}`}>

              </p>
            </div>

            <div className={`border rounded-xl p-3 flex flex-col justify-between text-left space-y-1.5 my-auto relative overflow-hidden ${
              isLight 
                ? 'bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200 shadow-sm' 
                : isCobalt 
                  ? 'bg-slate-50 border-slate-200 text-slate-850' 
                  : 'bg-white/[0.012] border-white/5'
            }`}>
              <div>
                <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-neutral-500' : 'text-slate-500'}`}>Запрашиваемый Объем</span>
                <span className={`block text-base sm:text-lg font-display font-black tracking-tighter uppercase mt-0.5 ${isLight ? 'text-amber-650' : isCobalt ? 'text-slate-900' : 'text-white'}`}>
                  {B(content[1] || "$100k — $550k", 1, "")}
                </span>
              </div>
              <p className={`text-[10px] sm:text-[10.5px] leading-snug font-sans font-medium ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-700' : 'text-slate-450'}`}>
                {B(content[2] || "Капитал будет направлен на подтверждение продуктовых метрик, технологический стек и маркетинг.", 2, "")}
              </p>
            </div>

            {slide.image && (
              <div 
                className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
                style={{ minHeight: '80px', height: '100%' }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Ask Illustration"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
            * Инвестиционная презентация готова к экспорту в высоком разрешении. Конфиденциально.
          </p>
        </div>
      );
    }
  };
  return (

    <div id="app-root" className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#0A0A0B] text-slate-200 font-sans antialiased selection:bg-white selection:text-black flex flex-col lg:flex-row">
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <div id="mobile-top-bar" className="lg:hidden h-16 border-b border-white/5 flex items-center justify-between px-5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
            <img
              src={decksyLogo}
              alt="Decksy"
              className="h-8 w-8 rounded-xl object-contain border border-white/10 bg-[#151515] shadow-[0_0_28px_rgba(255,93,68,0.16)]"
            />
            <span className="text-sm font-black tracking-tight text-white font-sans select-none">
              Decksy<span className="text-slate-400 font-medium"> Agent</span>
            </span>
          </div>
        </div>

        {/* Quick upgrade or profile on the right of mobile top bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setScreen('about')}
            className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all flex items-center space-x-1 border cursor-pointer ${
              screen === 'about'
                ? "bg-white text-black border-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
            title="О проекте"
          >
            <Info className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">О проекте</span>
          </button>

          <button
            onClick={() => setScreen('plans')}
            className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all flex items-center space-x-1 border cursor-pointer ${
              screen === 'plans'
                ? "bg-white text-black border-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
            title="Тарифы и Экономика"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Тарифы & Экономика</span>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-sm p-1 pr-1.5">
              <div className="w-5 h-5 rounded-full bg-[#161619] border border-[#FF5D44]/50 flex items-center justify-center text-[10px] font-bold text-[#FF5D44] uppercase font-mono">
                {user.name ? user.name[0] : user.email[0]}
              </div>
              <button
                onClick={handleLogout}
                className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer bg-transparent border-none flex animate-none"
                title="Выйти"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthError("");
                setAuthTab("login");
                setShowAuthModal(true);
              }}
              className="px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase rounded-sm transition-colors cursor-pointer"
            >
              Войти
            </button>
          )}

          {!isWatermarkRemoved ? (
            <button 
              onClick={() => setScreen('plans')}
              className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer hover:bg-slate-200"
            >
              Upgrade
            </button>
          ) : (
            <span className="px-2 py-0.5 bg-emerald-950/45 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold rounded-sm uppercase tracking-wider font-mono">
              PRO
            </span>
          )}
        </div>
      </div>

      {/* iOS GLASSMORPHIC BOTTOM DOCK FOR MOBILE */}
      <div id="mobile-bottom-dock" className="lg:hidden fixed bottom-5 left-4 right-4 h-16 bg-[#0E0E12]/90 backdrop-blur-xl border border-white/10 rounded-[28px] z-45 px-3 py-1.5 flex items-center justify-around shadow-[0_12px_40px_-10px_rgba(0,0,0,0.9)]">
        {/* Tab 1: Ввод идеи */}
        <button
          onClick={() => setScreen('intro')}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative cursor-pointer border-none bg-transparent ${
            screen === 'intro' ? 'text-[#FF5D44]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="h-5 w-5 shrink-0" />
          <span className="text-[9px] font-semibold mt-1 tracking-tight">Prompt</span>
          {screen === 'intro' && (
            <motion.div layoutId="activeMobileIndicator" className="absolute bottom-0 w-1 h-1 rounded-full bg-[#FF5D44]" />
          )}
        </button>

        {/* Tab 2: Чат-Интервью */}
        <button
          disabled={messages.length === 0 && screen === 'intro'}
          onClick={() => {
            if (messages.length > 0 || screen === 'interview' || screen === 'deck' || screen === 'generating') {
              setScreen('interview');
            }
          }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed border-none bg-transparent ${
            screen === 'interview' || screen === 'generating' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-5 w-5 shrink-0" />
          <span className="text-[9px] font-semibold mt-1 tracking-tight font-sans">Agent</span>
          {(screen === 'interview' || screen === 'generating') && (
            <motion.div layoutId="activeMobileIndicator" className="absolute bottom-0 w-1 h-1 rounded-full bg-blue-400" />
          )}
        </button>

        {/* Tab 3: Редактор слайдов */}
        <button
          disabled={!deck}
          onClick={() => {
            if (deck) {
              setScreen('deck');
            }
          }}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed border-none bg-transparent ${
            screen === 'deck' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-5 w-5 shrink-0" />
          <span className="text-[9px] font-semibold mt-1 tracking-tight">Output</span>
          {screen === 'deck' && (
            <motion.div layoutId="activeMobileIndicator" className="absolute bottom-0 w-1 h-1 rounded-full bg-emerald-400" />
          )}
        </button>

        {/* Tab 4: Мои проекты */}
        <button
          onClick={() => {
            fetchLibraryDecks();
            setShowLibraryDrawer(true);
          }}
          className="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-200"
        >
          <div className="relative">
            <FolderHeart className="h-5 w-5 shrink-0 text-rose-400" />
            {savedDecks.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF5D44] text-black text-[8px] font-black h-3.5 px-1 rounded-full flex items-center justify-center min-w-3.5">
                {savedDecks.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-semibold mt-1 tracking-tight font-sans">Files</span>
        </button>
      </div>

      {/* DESKTOP PERMANENT SIDEBAR PANEL */}
      <aside id="desktop-sidebar" className="hidden lg:flex w-72 bg-[#0B0B0D] border-r border-white/10 flex-col justify-between h-screen sticky top-0 p-6 shrink-0 z-40 select-none">
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="flex items-center gap-2">
              <img
                src={decksyLogo}
                alt="Decksy"
                className="h-10 w-10 rounded-2xl object-contain border border-white/10 bg-[#151515] transition-transform hover:scale-105 shadow-[0_0_34px_rgba(255,93,68,0.16)]"
              />
              <span className="text-lg font-black tracking-tight text-white font-sans">
                Decksy<span className="text-slate-400 font-medium"> Agent</span>
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="space-y-2 pt-2">
            <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">AI Workspace</div>
            
            {/* Nav Option 1: Ввод идеи / Главная */}
            <button
              onClick={() => setScreen('intro')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left border cursor-pointer ${
                screen === 'intro'
                  ? 'bg-[#FF5D44]/10 border-[#FF5D44]/15 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent bg-transparent'
              }`}
            >
              <Compass className="h-4 w-4 text-[#FF5D44] shrink-0" />
              <span>Prompt</span>
            </button>

            {/* Nav Option 1.5: О проекте */}
            <button
              onClick={() => setScreen('about')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left border cursor-pointer ${
                screen === 'about'
                  ? 'bg-purple-500/10 border-purple-500/15 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent bg-transparent'
              }`}
            >
              <Info className="h-4 w-4 text-purple-400 shrink-0" />
              <span>О проекте</span>
            </button>

            {/* Nav Option 1.6: Тарифы & Экономика */}
            <button
              onClick={() => setScreen('plans')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left border cursor-pointer ${
                screen === 'plans'
                  ? 'bg-emerald-500/10 border-emerald-500/15 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent bg-transparent'
              }`}
            >
              <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Тарифы & Экономика</span>
            </button>

            {/* Nav Option 2: Интервью с инвестором */}
            <button
              disabled={messages.length === 0 && screen === 'intro'}
              onClick={() => {
                if (messages.length > 0 || screen === 'interview' || screen === 'deck' || screen === 'generating') {
                  setScreen('interview');
                }
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left border disabled:opacity-25 disabled:cursor-not-allowed ${
                screen === 'interview' || screen === 'generating'
                  ? 'bg-amber-500/10 border-amber-500/15 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent bg-transparent'
              }`}
              title={messages.length === 0 && screen === 'intro' ? "Опишите вашу стартап идею, чтобы начать интервью" : "Посмотреть чат-интервью"}
            >
              <Users className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Agent Chat</span>
            </button>

            {/* Nav Option 3: Конструктор слайдов */}
            <button
              disabled={!deck}
              onClick={() => {
                if (deck) {
                  setScreen('deck');
                }
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left border disabled:opacity-25 disabled:cursor-not-allowed ${
                screen === 'deck'
                  ? 'bg-amber-500/10 border-amber-500/15 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent bg-transparent'
              }`}
              title={!deck ? "Презентация ещё не сгенерирована инвестором" : "Перейти к слайдам"}
            >
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Output Deck</span>
            </button>

            {/* Nav Option 4: Моя библиотека */}
            <button
              onClick={() => {
                fetchLibraryDecks();
                setShowLibraryDrawer(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold uppercase tracking-wider transition-all text-left border border-transparent bg-transparent cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FolderHeart className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Project Files</span>
              </div>
              {savedDecks.length > 0 && (
                <span className="bg-[#FF5D44] text-black text-[9px] font-extrabold h-4.5 px-1.5 rounded-full flex items-center justify-center min-w-4.5">
                  {savedDecks.length}
                </span>
              )}
            </button>

            {/* Reset option */}
            <button
              onClick={handleReset}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-xs font-semibold uppercase tracking-wider transition-all text-left border border-transparent bg-transparent mt-8 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>New Session</span>
            </button>
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          {isWatermarkRemoved ? (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/25 rounded-md flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Agent Pro Active
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-md space-y-2">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <LockKeyhole className="h-3 w-3 text-amber-500" />
                <span>Free Agent</span>
              </div>
              <button
                onClick={() => setScreen('plans')}
                className="w-full py-2 bg-gradient-to-r from-red-500 to-[#FF5D44] text-white hover:opacity-95 text-[10px] font-extrabold uppercase tracking-widest rounded-sm transition-all text-center flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
              >
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Upgrade Agent</span>
              </button>
            </div>
          )}

          <div className="text-center">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest block">
              DECKSY AGENT ONLINE
            </span>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN WORKSPACE WRAPPER */}
      <div className="flex-grow flex flex-col min-w-0 lg:h-screen lg:overflow-y-auto bg-[#09090B] relative">

        {/* TOP PROFILE HEADER & PREMIUM SUB BUTTON */}
        <header id="top-profile-bar" className="h-16 border-b border-white/10 flex items-center justify-between px-6 sm:px-8 bg-[#0D0D0F]/95 backdrop-blur-xl sticky top-0 z-35 shrink-0">
          
          {/* Active step indicator */}
          <div className="flex items-center space-x-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              {screen === 'intro' ? "Новый проект" : screen === 'interview' ? "Уточняем детали" : screen === 'generating' ? "Собираем pitch deck..." : "Презентация"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* BUY SUBSCRIPTION BUTTON IF NOT BOUGHT */}
            {!isWatermarkRemoved ? (
              <button 
                id="unlock-premium-header-btn"
                onClick={() => setScreen('plans')}
                className="px-3.5 py-1.5 bg-white text-black hover:bg-slate-200 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer rounded-full"
              >
                Upgrade
              </button>
            ) : (
              <span className="px-2.5 py-1.5 bg-emerald-950/45 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold rounded-sm uppercase tracking-wider font-mono">
                PRO ACTIVE
              </span>
            )}

            {/* Admin toggle door */}
            {user && user.role === 'admin' && (
              <button
                onClick={() => setScreen(screen === 'admin' ? 'intro' : 'admin')}
                className={`px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-wider font-mono font-black flex items-center space-x-1 border transition-all cursor-pointer ${
                  screen === 'admin'
                    ? "bg-[#FF5D44] border-[#FF5D44] text-white hover:bg-orange-600"
                    : "bg-[#161619]/60 hover:bg-[#FF5D44]/10 border-[#FF5D44]/30 text-[#FF5D44]"
                }`}
              >
                <Settings className="h-3 w-3" />
                <span>Админка</span>
              </button>
            )}

            {/* Profile badge / auth session */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-8">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-sm p-1 pr-2">
                  <div className="w-5 h-5 rounded-full bg-[#161619] border border-[#FF5D44]/50 flex items-center justify-center text-[10px] font-bold text-[#FF5D44] uppercase font-mono">
                    {user.name ? user.name[0] : user.email[0]}
                  </div>
                  <span className="hidden md:inline text-[11px] text-slate-300 truncate max-w-[95px] font-mono" title={user.email}>
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer bg-transparent border-none flex animate-none"
                    title="Выйти"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="login-header-btn"
                onClick={() => {
                  setAuthError("");
                  setAuthTab("login");
                  setShowAuthModal(true);
                }}
                className="px-3 py-1.5 bg-[#161619] border border-white/10 text-slate-300 hover:text-white hover:bg-neutral-800 text-[11px] font-semibold rounded-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>Войти / Регистрация</span>
              </button>
            )}

          </div>
        </header>

      {/* ATTACH PROJECT VISUALS PROMPT MODAL */}
      <AnimatePresence>
        {showImagePromptModal && (
          <motion.div
            id="image-prompt-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#111115] border border-white/10 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100"
            >
              {/* Decorative glows */}
              <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-650/10 blur-3xl pointer-events-none"></div>

              <div className="text-center space-y-2 relative z-10">
                <div className="mx-auto inline-flex items-center space-x-1 border border-white/10 px-3 py-0.5 rounded-full uppercase tracking-widest font-mono text-[9px] text-sky-400">
                  <Image className="h-3 w-3" />
                  <span>ШАГ 1.5 • ДОБАВЛЕНИЕ КАРТИНОК И СХЕМ</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
                  Добавьте визуальные материалы к проекту
                </h3>
                <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                  Логотип, графики рынка, скриншоты вашего продукта или кьюар-код (QR). Наш ИИ автоматически распределит их по слайдам, интегрирует в контент и перепишет речь спикера!
                </p>
              </div>

              {/* Upload area */}
              <div className="relative z-10 space-y-4">
                <div className="border border-dashed border-white/10 hover:border-sky-500/30 bg-[#161619]/40 rounded-xl p-6 text-center transition-all relative group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        Array.from(files).forEach((item) => {
                          const file = item as File;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              // Infer description from name
                              let inferredDesc = "Иллюстрация продукта";
                              const nameLower = file.name.toLowerCase();
                              if (nameLower.includes("logo") || nameLower.includes("лого")) {
                                inferredDesc = "Логотип проекта";
                              } else if (nameLower.includes("market") || nameLower.includes("рынок") || nameLower.includes("chart") || nameLower.includes("график")) {
                                inferredDesc = "График или тренд рынка";
                              } else if (nameLower.includes("screen") || nameLower.includes("скрин") || nameLower.includes("mockup")) {
                                inferredDesc = "Скриншот интерфейса продукта";
                              } else if (nameLower.includes("qr") || nameLower.includes("кьюар")) {
                                inferredDesc = "QR-код со ссылкой или контактами";
                              }

                              setSessionImages((prev) => [
                                ...prev,
                                {
                                  id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                  image: reader.result,
                                  description: inferredDesc
                                }
                              ]);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mx-auto border border-sky-400/20 group-hover:scale-105 transition-transform">
                      <Image className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white font-bold uppercase tracking-wider">Нажмите или перетащите файлы</p>
                      <p className="text-[10px] text-slate-500">Поддерживаются PNG, JPG, JPEG (можно выбрать несколько)</p>
                    </div>
                  </div>
                </div>

                {/* List of currently uploaded images in modal with inputs */}
                {sessionImages.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Загруженные материалы ({sessionImages.length}):</p>
                    <div className="space-y-2">
                      {sessionImages.map((sImg, sIdx) => (
                        <div key={sImg.id} className="flex gap-3 bg-[#111115] border border-white/5 p-2 rounded-lg relative group">
                          <button
                            type="button"
                            onClick={() => setSessionImages(prev => prev.filter(item => item.id !== sImg.id))}
                            className="absolute top-2 right-2 text-[10px] text-red-500 hover:text-red-400 font-mono z-10 cursor-pointer"
                            title="Удалить"
                          >
                            ✖
                          </button>
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-black/50 border border-white/10 flex items-center justify-center">
                            <img src={sImg.image} className="h-full w-full object-cover" alt="Loaded visual asset" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-grow space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">Изображение #{sIdx + 1}</span>
                            </div>
                            <input
                              type="text"
                              value={sImg.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSessionImages(prev => prev.map(item => item.id === sImg.id ? { ...item, description: val } : item));
                              }}
                              placeholder="Что изображено? (Логотип, скриншот, график, QR и т.д.)"
                              className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-400 font-sans"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowImagePromptModal(false);
                    setIsSelectingStyle(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors rounded uppercase text-[10px] font-bold tracking-widest cursor-pointer border border-white/5 text-center"
                >
                  {sessionImages.length === 0 ? "Пропустить этот шаг" : "Продолжить"}
                </button>
                {sessionImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowImagePromptModal(false);
                      setIsSelectingStyle(true);
                    }}
                    className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:opacity-90 transition-all font-bold uppercase text-[10px] tracking-widest cursor-pointer rounded flex items-center justify-center space-x-2"
                  >
                    <span>Готово, к дизайну</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THEME SELECTOR OVERLAY MODAL */}
      <AnimatePresence>
        {isSelectingStyle && (
          <motion.div
            id="theme-selection-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#111115] border border-white/10 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100"
            >
              {/* Decorative radial background glowing elements */}
              <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-650/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-650/10 blur-3xl pointer-events-none"></div>

              <div className="text-center space-y-2 relative z-10">
                <div className="mx-auto inline-flex items-center space-x-1 border border-white/10 px-3 py-0.5 rounded-full uppercase tracking-widest font-mono text-[9px] text-cyan-300">
                  <Sparkles className="h-3 w-3" />
                  <span>ШАГ 2 • ВЫБОР ДИЗАЙНА</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Выберите стиль презентации
                </h3>
                <p className="text-xs text-slate-400 font-sans max-w-lg mx-auto">
                  Стиль определяет шрифты, фон слайдов, структуру bento-блоков и акценты при экспорте в PPTX/PDF. Вы сможете изменить его и после генерации!
                </p>
              </div>

              {/* Theme Choices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                
                {/* 1. COBALT BLUE THEME card */}
                <div
                  id="theme-choice-cobalt"
                  onClick={() => setSelectedStyle('cobalt')}
                  className={`cursor-pointer rounded-xl p-5 border text-left flex flex-col justify-between space-y-4 transition-all relative overflow-hidden group ${
                    selectedStyle === 'cobalt'
                      ? 'bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/40'
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Кобальтовая (Unexao)</span>
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center p-0.5 ${
                        selectedStyle === 'cobalt' ? 'border-blue-400' : 'border-white/20'
                      }`}>
                        {selectedStyle === 'cobalt' && <span className="h-2 w-2 rounded-full bg-blue-450 bg-blue-500"></span>}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Яркий электрический синий на главном слайде, переходящий в молочно-сизый минимализм на детальных картах. Корпоративный топ-стандарт.
                    </p>
                  </div>

                  {/* Visual preview palette block */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-[#09090b] rounded-lg border border-white/5">
                    <div className="h-5 rounded bg-[#004de6] flex items-center justify-center text-[8px] font-mono font-bold text-white uppercase">C</div>
                    <div className="h-5 rounded bg-[#f5f9ff] flex items-center justify-center text-[8px] font-mono text-slate-900 font-bold">W</div>
                    <div className="h-5 rounded bg-blue-100 flex items-center justify-center text-[7px] font-mono text-slate-800">B</div>
                    <div className="h-5 rounded bg-[#011627] flex items-center justify-center text-[7px] font-mono text-slate-300">D</div>
                  </div>
                </div>

                {/* 2. SWISS LIGHT THEME card */}
                <div
                  id="theme-choice-light"
                  onClick={() => setSelectedStyle('clean-light')}
                  className={`cursor-pointer rounded-xl p-5 border text-left flex flex-col justify-between space-y-4 transition-all relative overflow-hidden group ${
                    selectedStyle === 'clean-light'
                      ? 'bg-white/10 border-white/40 ring-2 ring-white/25'
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Светлая (Swiss)</span>
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center p-0.5 ${
                        selectedStyle === 'clean-light' ? 'border-white' : 'border-white/20'
                      }`}>
                        {selectedStyle === 'clean-light' && <span className="h-2 w-2 rounded-full bg-white"></span>}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Швейцарская эстетика. Безупречно белые карточки, благородный графит для текстов и штриховые границы. Абсолютная стерильность и читаемость.
                    </p>
                  </div>

                  {/* Visual preview palette block */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-white rounded-lg border border-white/10">
                    <div className="h-5 rounded bg-neutral-900 flex items-center justify-center text-[8px] font-mono font-bold text-white uppercase">D</div>
                    <div className="h-5 rounded bg-white border border-neutral-200 flex items-center justify-center text-[8px] font-mono text-neutral-900 font-bold">W</div>
                    <div className="h-5 rounded bg-neutral-100 flex items-center justify-center text-[7px] font-mono text-neutral-800">G</div>
                    <div className="h-5 rounded bg-slate-200 flex items-center justify-center text-[7px] font-mono text-slate-500">S</div>
                  </div>
                </div>

                {/* 3. COSMIC DARK THEME card */}
                <div
                  id="theme-choice-dark"
                  onClick={() => setSelectedStyle('cosmic-dark')}
                  className={`cursor-pointer rounded-xl p-5 border text-left flex flex-col justify-between space-y-4 transition-all relative overflow-hidden group ${
                    selectedStyle === 'cosmic-dark'
                      ? 'bg-emerald-950/15 border-emerald-500 ring-2 ring-emerald-500/40'
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Темная (Cosmic Slate)</span>
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center p-0.5 ${
                        selectedStyle === 'cosmic-dark' ? 'border-emerald-400' : 'border-white/20'
                      }`}>
                        {selectedStyle === 'cosmic-dark' && <span className="h-2 w-2 rounded-full bg-emerald-400"></span>}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Эффект полного погружения. Футуристичный темный сланец с изумрудными акцентами и тонкими неоновыми линиями. Прогрессивно и стильно.
                    </p>
                  </div>

                  {/* Visual preview palette block */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-[#09090b] rounded-lg border border-white/5">
                    <div className="h-5 rounded bg-[#111115] border border-white/10 flex items-center justify-center text-[8px] font-mono font-bold text-slate-300 uppercase">CS</div>
                    <div className="h-5 rounded bg-emerald-500 flex items-center justify-center text-[8px] font-mono text-white font-bold">E</div>
                    <div className="h-5 rounded bg-[#161618] flex items-center justify-center text-[7px] font-mono text-slate-400">G</div>
                    <div className="h-5 rounded bg-[#030712] flex items-center justify-center text-[7px] font-mono text-slate-500">B</div>
                  </div>
                </div>

              </div>

              {/* Action buttons footer */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-slate-200">
                <div className="text-left">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Текущий выбор:</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {selectedStyle === 'cobalt' && "🔷 Кобальтовая (Unexao) • Корпоративный стиль"}
                    {selectedStyle === 'clean-light' && "⚪ Светлая (Swiss Minimal) • Печать & Минимализм"}
                    {selectedStyle === 'cosmic-dark' && "🟢 Темная (Cosmic Slate) • Премиум стиль"}
                  </span>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsSelectingStyle(false)}
                    className="w-full sm:w-auto px-5 py-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors rounded uppercase text-[10px] font-bold tracking-widest cursor-pointer border border-white/5"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectingStyle(false);
                      runGenerateDeck();
                    }}
                    className="w-full sm:w-auto px-8 py-2.5 bg-white text-black hover:bg-slate-200 transition-all font-bold uppercase text-[10px] tracking-widest cursor-pointer rounded flex items-center justify-center space-x-2"
                  >
                    <span>СГЕНЕРИРОВАТЬ</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NATIVE SECURE AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            id="auth-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              id="auth-modal-content"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#111115] border border-white/10 rounded-2xl max-w-sm w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100"
            >
              {/* Radial glow */}
              <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
              
              <div className="text-center space-y-2 relative z-10">
                <div className="mx-auto inline-flex items-center space-x-1 px-3 py-0.5 rounded-full uppercase tracking-widest font-mono text-[9px] bg-amber-500/10 text-[#F59E0B] border border-amber-500/20">
                  <span>DECKSY SECURE PRO</span>
                </div>
                <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">
                  {authTab === 'login' ? 'Вход в аккаунт' : 'Создать аккаунт'}
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  {authTab === 'login' 
                    ? 'Войдите, чтобы сохранять презентации и синхронизировать проекты.' 
                    : 'Зарегистрируйтесь, чтобы получить персональную ИИ-библиотеку.'}
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs text-center flex items-center justify-center space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authInfo && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs text-center flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{authInfo}</span>
                </div>
              )}

              {oauthProviders.length > 0 && (
                <div className="space-y-2 relative z-10">
                  <div className="grid grid-cols-2 gap-2">
                    {oauthProviders
                      .filter((provider) => provider.id !== "vk" && provider.id !== "mailru")
                      .map((provider) => (
                        <button
                          key={provider.id}
                          type="button"
                          disabled={!provider.enabled}
                          onClick={() => {
                            if (provider.enabled) {
                              window.location.href = `/api/auth/oauth/${provider.id}`;
                            }
                          }}
                          className={`py-2 rounded-lg border text-[10px] font-mono uppercase tracking-wider font-bold transition-colors ${
                            provider.enabled
                              ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 cursor-pointer"
                              : "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed"
                          }`}
                          title={provider.enabled ? `Войти через ${provider.label}` : `${provider.label} OAuth пока не настроен`}
                        >
                          {provider.label}
                        </button>
                      ))}
                  </div>
                  {oauthProviders.some((provider) => provider.id === "vk" && provider.enabled) ? (
                    <div ref={vkidContainerRef} className="min-h-[44px] rounded-lg overflow-hidden" />
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 rounded-lg border bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed text-[10px] font-mono uppercase tracking-wider font-bold"
                    >
                      VK ID / Mail.ru пока не настроен
                    </button>
                  )}
                </div>
              )}

              <div className="relative z-10 flex items-center gap-3 text-[9px] uppercase tracking-widest font-mono text-slate-600">
                <span className="h-px bg-white/10 flex-1" />
                <span>или email</span>
                <span className="h-px bg-white/10 flex-1" />
              </div>

              {authVerificationPending ? (
                <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Код из письма</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={authVerificationCode}
                      onChange={e => setAuthVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="w-full bg-[#161618] border border-white/10 rounded px-3 py-2 text-center text-xl tracking-[0.35em] text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#F59E0B] font-mono"
                    />
                    <p className="text-[10px] text-slate-500 text-center">
                      Мы отправили код на {authEmail || "вашу почту"}. Код действует 15 минут.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyEmailCode}
                    disabled={authLoading || authVerificationCode.length !== 6}
                    className="w-full py-2.5 bg-white text-black hover:bg-slate-200 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all font-bold uppercase text-xs tracking-widest rounded flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Подтвердить email</span>}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
                  {authTab === 'register' && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Ваше имя</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        placeholder="Алексей"
                        className="w-full bg-[#161618] border border-white/10 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#F59E0B] font-sans"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Email адрес</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="founder@decksy.ai"
                      className="w-full bg-[#161618] border border-white/10 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#F59E0B] font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Пароль</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#161618] border border-white/10 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#F59E0B] font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-white text-black hover:bg-slate-200 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all font-bold uppercase text-xs tracking-widest rounded flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>{authTab === 'login' ? 'Войти' : 'Создать кабинет'}</span>
                    )}
                  </button>
                </form>
              )}

              <div className="text-center pt-2 relative z-10 border-t border-white/5">
                {(authTab === 'login' || authVerificationPending) && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={authLoading}
                    className="block mx-auto mb-2 text-[11px] text-slate-400 hover:text-slate-200 transition-colors font-semibold bg-transparent border-none cursor-pointer disabled:opacity-50"
                  >
                    Отправить код повторно
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    setAuthInfo("");
                    setAuthVerificationPending(false);
                    setAuthVerificationCode("");
                    setAuthTab(authTab === 'login' ? 'register' : 'login');
                  }}
                  className="text-xs text-amber-500 hover:text-amber-400 transition-colors font-semibold bg-transparent border-none cursor-pointer"
                >
                  {authVerificationPending
                    ? 'Вернуться к входу'
                    : authTab === 'login' 
                    ? 'Нет аккаунта? Зарегистрироваться' 
                    : 'Уже есть аккаунт? Войти'}
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAVED PRESENTATIONS LIBRARY DRAWER */}
      <AnimatePresence>
        {showLibraryDrawer && (
          <motion.div
            id="library-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLibraryDrawer(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
          >
            <motion.div
              id="library-drawer-content"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()} // prevent close on clicking panel
              className="bg-[#0D0D10] border-l border-white/10 w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl relative text-slate-200"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-[#F59E0B]" />
                    <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">Моя библиотека</h3>
                  </div>
                  <button
                    onClick={() => setShowLibraryDrawer(false)}
                    className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 cursor-pointer"
                  >
                    Закрыть
                  </button>
                </div>

                {/* Subtitle */}
                <p className="text-[11px] text-slate-400 font-sans mb-4 leading-relaxed">
                  Показаны презентации, сохраненные локально в вашей базе данных Prisma. Нажмите на проект, чтобы загрузить его в редактор.
                </p>

                {/* Body: list of decks */}
                <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {libraryLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Загрузка проектов...</span>
                    </div>
                  ) : savedDecks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-4 rounded-xl border border-dashed border-white/5 bg-white/[0.01]">
                      <FolderHeart className="h-10 w-10 text-slate-600" />
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-slate-300">Презентаций пока нет</span>
                        <span className="block text-[11px] text-slate-500 max-w-xs leading-normal">
                          Созданные презентации будут автоматически сохраняться в вашей учетной записи.
                        </span>
                      </div>
                    </div>
                  ) : (
                    savedDecks.map((savedDeck) => {
                      const isCurrent = deck && deck.id === savedDeck.id;
                      return (
                        <div
                          key={savedDeck.id}
                          onClick={() => loadSavedDeck(savedDeck)}
                          className={`group cursor-pointer rounded-xl p-4 border text-left flex flex-col justify-between space-y-3 transition-all relative overflow-hidden ${
                            isCurrent
                              ? "bg-[#FF5D44]/15 border-[#FF5D44]/40"
                              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.4] hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-[#FF5D44] transition-colors">
                                {savedDeck.title || "Без названия"}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {savedDeck.idea}
                              </p>
                            </div>
                            
                            <button
                              onClick={(e) => deleteSavedDeckSubmit(savedDeck.id, e)}
                              className="text-slate-500 hover:text-rose-450 transition-colors p-1 rounded hover:bg-rose-500/5 cursor-pointer shrink-0 bg-transparent border-none"
                              title="Удалить презентацию"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono pt-2 border-t border-white/5">
                            <div className="flex items-center space-x-1 text-slate-500 uppercase font-bold tracking-widest">
                              <span className={`h-1.5 w-1.5 rounded-full ${savedDeck.mode === 'shark' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                              <span>{savedDeck.mode === 'shark' ? "Shark mode" : "VC Partner"}</span>
                            </div>

                            <span className="text-slate-500">
                              {new Date(savedDeck.updatedAt).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="pt-4 border-t border-white/5 mt-4 text-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  DECKSY AI CLOUD WORKSPACE • SECURE
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* VIEW: ADMIN PANEL SCREEN */}
        {legalPage && (
          <LegalPage
            page={legalPage}
            onBackToGenerator={openGeneratorRoot}
          />
        )}

        {!legalPage && screen === 'admin' && (
          <AdminPanel 
            authToken={authToken} 
            onBack={() => setScreen('intro')} 
            onSubscriptionChanged={handleSubscriptionChanged}
          />
        )}

        {/* VIEW: SUBSCRIPTION PLANS SCREEN */}
        {!legalPage && screen === 'plans' && (
          <SubscriptionPlans
            user={user}
            onUpdateUser={(updatedUser) => {
              setUser(updatedUser);
              setIsWatermarkRemoved(updatedUser.isPro || false);
            }}
            onOpenAuth={() => {
              setAuthError("");
              setAuthTab("login");
              setShowAuthModal(true);
            }}
            onBackToGenerator={() => setScreen('intro')}
          />
        )}

        {/* VIEW: ABOUT PROJECT SCREEN */}
        {!legalPage && screen === 'about' && (
          <AboutPage
            onBackToGenerator={() => setScreen('intro')}
            loadExampleDeck={loadExampleDeck}
            exampleDecks={EXAMPLE_DECKS}
          />
        )}
        
        {/* VIEW 1: INTRO SCREEN */}
        {!legalPage && screen === 'intro' && (
          <IntroPage
            idea={idea}
            setIdea={setIdea}
            suggestions={suggestions}
            isLoading={isLoading}
            handleStartInterview={handleStartInterview}
            userName={user?.name || user?.email?.split("@")[0]}
            activeAds={activeAds}
          />
        )}

        {/* VIEW 2: THE VC BOARDROOM INTERVIEW SCREEN */}
        {/* VIEW 2: THE VC BOARDROOM INTERVIEW SCREEN */}
        {!legalPage && screen === 'interview' && (
          <InterviewPage
            mode={mode}
            underlyingThoughts={underlyingThoughts}
            currentSentiment={currentSentiment}
            messages={messages}
            isLoading={isLoading}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            sessionImages={sessionImages}
            setSessionImages={setSessionImages}
            handleGenerateDeck={handleGenerateDeck}
            canvas={canvas}
          />
        )}

        {/* VIEW 3: LOADING TRANSITION TO MAGIC PITCH DECK */}
        {!legalPage && screen === 'generating' && (
          <GeneratingPage generationProgress={generationProgress} />
        )}

        {/* VIEW 4: MAGIC FINAL PRESENTATION DECK STAGE */}
        {!legalPage && screen === 'deck' && deck && (
          <motion.div 
            id="screen-deck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            
            {/* Watermark Notice */}
            {!isWatermarkRemoved && (
              <div className="bg-gradient-to-br from-[#161618] to-[#0D0D0F] border border-white/10 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center space-x-3.5 text-left">
                  <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-white font-mono">Бесплатный тарифный план</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">На скачанных PPTX слайдах нанесен водяной знак «AI Generated». Уберите водяной знак, чтобы получить готовый для фондов PPTX-архив.</p>
                  </div>
                </div>
                <button
                  id="unlock-premium-btn"
                  onClick={() => setScreen('plans')}
                  className="bg-gradient-to-r from-purple-500 to-[#FF5D44] text-white font-extrabold uppercase tracking-widest text-[10px] px-5 py-3 rounded-sm transition-all cursor-pointer flex-shrink-0 animate-pulse"
                >
                  Выбрать тариф и убрать знак
                </button>
              </div>
            )}

            {isWatermarkRemoved && (
              <div className="bg-gradient-to-br from-[#161618] to-[#0D0D0F] border border-green-500/20 p-5 rounded-lg flex items-center space-x-3.5 text-left">
                <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/25">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-white font-mono">Версия PRO активирована</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Водяной знак убран. Наслаждайтесь премиальным экспортом в PowerPoint и оригинальной версткой.</p>
                </div>
              </div>
            )}

            {/* Dynamic Slogan Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-sky-950/20 border border-sky-500/20 rounded-lg px-4 py-2.5 text-[11px] text-sky-300 flex items-center">
                <span>✎ Нажмите на текст в слайде, чтобы изм. Скачать PDF/PPTX — справа.</span>
              </div>
              
              <div className="flex items-center justify-between bg-[#0D0D0F] border border-white/10 px-3 py-1.5 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
                  Стиль темы:
                </span>
                <div className="flex items-center space-x-1 bg-white/5 p-0.5 rounded border border-white/5">
                  <button
                    onClick={() => setSelectedStyle('cobalt')}
                    className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all ${
                      selectedStyle === 'cobalt'
                        ? 'bg-[#004de6] text-white font-bold shadow-inner'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Кобальт
                  </button>
                  <button
                    onClick={() => setSelectedStyle('clean-light')}
                    className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all ${
                      selectedStyle === 'clean-light'
                        ? 'bg-white text-black font-bold shadow-inner'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Светлая
                  </button>
                  <button
                    onClick={() => setSelectedStyle('cosmic-dark')}
                    className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all ${
                      selectedStyle === 'cosmic-dark'
                        ? 'bg-emerald-600 text-white font-bold shadow-inner'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Темная
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex flex-col sm:flex-row sm:items-center sm:space-x-3 justify-center sm:justify-start">
                <span>{deck.title}</span>
                <span className="text-[9px] font-mono bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded uppercase self-center mt-1 sm:mt-0 font-bold tracking-widest">PITCH DECK</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{deck.subtitle}</p>
            </div>

            {/* PRESENTATION WORKSPACE: GRID MAIN */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: THE ACTIVE SLIDE ASPECT (16:9 VIEW) + SPEAK PLAYS (7 COLS) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Visual Slide Frame with standard 16:9 box ratio in styling */}
                {(() => {
                  const isThemeLight = selectedStyle === 'clean-light';
                  const isThemeCobalt = selectedStyle === 'cobalt';
                  const activeSlideType = deck.slides[activeSlideIndex]?.type || '';
                  const isTitleSlide = activeSlideIndex === 0 || activeSlideType === 'title';
                  
                  // Visual frames style mapping
                  let frameClass = "aspect-video w-full rounded-2xl p-5 sm:p-7 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all border ";
                  let frameStyle: React.CSSProperties = {};
                  let headerClass = "flex items-center justify-between text-[8px] sm:text-[9px] font-mono pb-2 relative z-10 border-b ";
                  let footerClass = "pt-2 flex items-center justify-between text-[7px] sm:text-[8px] font-mono uppercase tracking-widest relative z-10 border-t ";
                  let gridBg = "";
                  let gridBgSize = "40px 40px";
                  
                  if (isThemeLight) {
                    frameClass += "border-neutral-200/95";
                    frameStyle = { background: 'linear-gradient(to bottom, #ffffff, #fafafa)' };
                    headerClass += "border-neutral-200/60 text-neutral-400";
                    footerClass += "border-neutral-200/60 text-neutral-400";
                    gridBg = "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)";
                    gridBgSize = "30px 30px";
                  } else if (isThemeCobalt) {
                    if (isTitleSlide) {
                      frameClass += "border-white/10";
                      frameStyle = { background: 'linear-gradient(to bottom right, #0b45cf, #001f7a)' };
                      headerClass += "border-white/10 text-blue-200/65";
                      footerClass += "border-white/10 text-blue-200/65";
                      gridBg = "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)";
                      gridBgSize = "35px 35px";
                    } else {
                      frameClass += "border-blue-100/50";
                      frameStyle = { background: 'linear-gradient(to bottom, #ffffff, #f7faf5)' };
                      headerClass += "border-blue-100/50 text-slate-400";
                      footerClass += "border-blue-100/50 text-slate-400";
                      gridBg = "linear-gradient(rgba(0,77,230,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(0,77,230,0.008) 1px, transparent 1px)";
                      gridBgSize = "45px 45px";
                    }
                  } else {
                    frameClass += "border-white/5 hover:border-white/8";
                    frameStyle = { background: 'linear-gradient(to bottom, #09090b, #040405)' };
                    headerClass += "border-white/5 text-slate-500";
                    footerClass += "border-white/5 text-slate-500";
                    gridBg = "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)";
                    gridBgSize = "40px 40px";
                  }

                  return (
                    <div className={frameClass} style={frameStyle}>
                      {/* Decorative grid pattern */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: gridBg,
                          backgroundSize: gridBgSize
                        }}
                      />
                      
                      {!isThemeLight && !isThemeCobalt && (
                        <>
                          {/* Premium glow blobs matching the provided Apex template */}
                          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none"></div>
                          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/8 blur-[80px] pointer-events-none"></div>
                        </>
                      )}

                      {/* Header bar */}
                      <div className={headerClass}>
                        <span className={`${isThemeLight ? "text-neutral-900 font-bold" : isThemeCobalt && isTitleSlide ? "text-white font-bold" : isThemeCobalt ? "text-[#004de6] font-bold" : "text-white"} uppercase tracking-widest font-bold`}>{deck.title}</span>
                        <span>СЛАЙД {activeSlideIndex + 1} ИЗ {deck.slides.length}</span>
                      </div>

                      {/* Centered actual layout content inside */}
                      <div className="my-auto relative z-10 h-[74%] flex flex-col justify-stretch">
                        {renderSlideContent(
                          deck.slides[activeSlideIndex],
                          activeSlideIndex,
                          false,
                          (patch) => updateSlide(activeSlideIndex, patch)
                        )}
                      </div>

                      {/* Footer bar */}
                      <div className={footerClass}>
                        <span>© {deck.title} • Seed Round</span>
                        <span className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                          {isWatermarkRemoved ? `Проект: ${deck.title}` : "Сгенерировано Decksy.ai"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* SLIDE CONTROL SELECTOR CAROUSEL */}
                <div className="flex items-center justify-between bg-[#0D0D0F] border border-white/10 rounded-md p-3">
                  <button
                    id="prev-slide-btn"
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex(prev => prev - 1)}
                    className="h-9 w-9 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-md flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex space-x-1.5 overflow-x-auto px-2 py-1 select-none max-w-[280px] sm:max-w-md md:max-w-lg scrollbar-none">
                    {deck.slides.map((_, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => setActiveSlideIndex(sIdx)}
                        className={`h-7 w-7 text-xs font-mono font-bold rounded flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                          activeSlideIndex === sIdx
                            ? 'bg-white text-black font-extrabold'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {sIdx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    id="next-slide-btn"
                    disabled={activeSlideIndex === deck.slides.length - 1}
                    onClick={() => setActiveSlideIndex(prev => prev + 1)}
                    className="h-9 w-9 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-md flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* ORATOR SPEECH SCRIPT AUDIO SPEAKER notes per slide */}
                <div className="bg-[#0D0D0F] border border-white/10 rounded-md p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-sm bg-white/5 flex items-center justify-center text-white border border-white/10 flex-shrink-0">
                        <Volume2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Шпаргалка спикера (Текст питча)</h4>
                        <p className="text-[10px] text-slate-500">Читайте этот текст во время демонстрации этого слайда:</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSpeakSpeech(deck.slides[activeSlideIndex]?.speechScript)}
                        className="text-[9px] uppercase tracking-wider font-extrabold bg-white/5 text-white border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-sm cursor-pointer transition-colors"
                      >
                        Озвучить (TTS)
                      </button>
                      <button
                        onClick={() => handleCopySpeech(deck.slides[activeSlideIndex]?.speechScript, activeSlideIndex)}
                        className="text-[9px] uppercase tracking-wider font-extrabold bg-white/5 text-white border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-sm cursor-pointer transition-colors"
                      >
                        Копировать речь
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={deck.slides[activeSlideIndex]?.speechScript || ""}
                    onChange={(e) =>
                      updateSlide(activeSlideIndex, { speechScript: e.target.value })
                    }
                    rows={5}
                    className="w-full text-xs text-slate-300 leading-relaxed font-sans bg-black/40 p-4 rounded border border-white/5 resize-y focus:outline-none focus:border-sky-400/40"
                    placeholder="Текст, который вы говорите на этом слайде..."
                  />
                </div>

                {/* Inline slide editor */}
                <div className="bg-[#0D0D0F] border border-sky-500/20 rounded-md p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                      ✎ Редактирование слайда {activeSlideIndex + 1}
                    </h4>
                    <span className="text-[9px] text-slate-500">Кликните на текст в слайде или меняйте здесь</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Заголовок</label>
                    <input
                      value={deck.slides[activeSlideIndex]?.title || ""}
                      onChange={(e) => updateSlide(activeSlideIndex, { title: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Подзаголовок</label>
                    <input
                      value={deck.slides[activeSlideIndex]?.subtitle || ""}
                      onChange={(e) => updateSlide(activeSlideIndex, { subtitle: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Пункты (каждый с новой строки)</label>
                    <textarea
                      value={(deck.slides[activeSlideIndex]?.content || []).join("\n")}
                      onChange={(e) => updateSlideBullets(activeSlideIndex, e.target.value.split("\n"))}
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400/40 resize-y font-sans"
                    />
                  </div>

                  {/* Image uploading feature with AI understanding */}
                  <div className="border-t border-white/5 pt-3 mt-3 space-y-3">
                    <div className="flex items-center space-x-1.5 text-sky-400">
                      <Image className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Изображение слайда с AI</span>
                    </div>

                    {deck.slides[activeSlideIndex]?.image ? (
                      <div className="space-y-3 bg-black/30 p-2.5 rounded border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Изображение прикреплено
                          </span>
                          <button
                            type="button"
                            onClick={() => updateSlide(activeSlideIndex, { image: undefined, imageDescription: undefined })}
                            className="text-[9px] text-red-400 hover:text-red-300 font-mono cursor-pointer transition-colors"
                          >
                            ✖ Удалить изображение
                          </button>
                        </div>

                        <div className="h-20 w-full overflow-hidden rounded border border-white/10 bg-black/40 flex items-center justify-center">
                          <img 
                            src={deck.slides[activeSlideIndex]?.image} 
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover" 
                            alt="Uploaded slide layout" 
                          />
                        </div>

                        {/* Theme or description field */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-400 uppercase tracking-wider font-mono block">Что изображено на картинке? (для AI)</label>
                          <textarea
                            value={deck.slides[activeSlideIndex]?.imageDescription || ""}
                            onChange={(e) => updateSlide(activeSlideIndex, { imageDescription: e.target.value })}
                            placeholder="Опишите тему изображения (например: Смартфон с открытым графиком прибыли и клиентом в кофейне)"
                            rows={2}
                            className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400/40 font-sans"
                          />
                        </div>

                        {/* Rewrite AI action button */}
                        <button
                          type="button"
                          onClick={() => handleRewriteSlideWithAI(activeSlideIndex, deck.slides[activeSlideIndex]?.imageDescription || "")}
                          disabled={isRewritingSlide}
                          className="w-full h-8 text-[10px] font-mono uppercase tracking-widest font-extrabold flex items-center justify-center space-x-1.5 bg-gradient-to-r from-sky-500/15 via-blue-500/15 to-indigo-500/15 border border-sky-400/30 hover:border-sky-400/60 text-sky-300 hover:text-sky-200 rounded cursor-pointer transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                          {isRewritingSlide ? (
                            <>
                              <span className="h-2.5 w-2.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                              <span>Переписываем слайд через ИИ...</span>
                            </>
                          ) : (
                            <>
                              <span>✨ Переписать слайд под картинку (ИИ)</span>
                            </>
                          )}
                        </button>
                        {rewriteError && (
                          <p className="text-[10px] text-red-400 text-center font-mono">{rewriteError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#121214] p-3 rounded border border-dashed border-white/10 space-y-3">
                        <p className="text-[9.5px] text-slate-400 leading-normal text-center">
                          Вы можете загрузить изображение, чтобы придать визуальный стиль слайду (доступно для Title и Problem слайдов).
                        </p>

                        <div className="grid grid-cols-1 gap-2">
                          {/* File input (base64 conversion) */}
                          <label className="w-full h-9 flex items-center justify-center space-x-1.5 border border-white/10 rounded cursor-pointer bg-black/40 hover:bg-white/[0.03] transition-colors">
                            <Upload className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] text-slate-300 font-medium">Загрузить файл картинки</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      updateSlide(activeSlideIndex, { 
                                        image: reader.result,
                                        imageDescription: "Изображение к проекту"
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <div className="flex items-center space-x-2 text-[9px] text-slate-500">
                            <span className="h-px bg-white/5 flex-grow"></span>
                            <span>Или вставить URL</span>
                            <span className="h-px bg-white/5 flex-grow"></span>
                          </div>

                          {/* Quick URL setter */}
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Вставьте ссылку на изображение..."
                              className="flex-grow bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-sky-400/40"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const target = e.currentTarget;
                                  if (target.value.trim()) {
                                    updateSlide(activeSlideIndex, {
                                      image: target.value.trim(),
                                      imageDescription: "Иллюстрация к слайду"
                                    });
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.previousSibling as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  updateSlide(activeSlideIndex, {
                                    image: input.value.trim(),
                                    imageDescription: "Иллюстрация к слайду"
                                  });
                                }
                              }}
                              className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 px-2.5 rounded text-[10px] text-sky-400 cursor-pointer"
                            >
                              ОК
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: ACTIONS + INTENSE VC ROAST PANELS (4 COLS) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Action Export card */}
                <div className="bg-[#0D0D0F] border border-white/10 rounded-md p-5 space-y-4 shadow-xl">
                  <h3 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-2">Операции с презентацией</h3>
                  
                  <div className="grid grid-cols-1 gap-2">
                    
                    {user && (
                      <button
                        onClick={() => saveDeckToDatabase(deck)}
                        disabled={saveInProgress}
                        className={`w-full font-extrabold uppercase tracking-widest text-[9.5px] py-3.5 px-4 rounded-sm flex items-center justify-between cursor-pointer border transition-all ${
                          saveInProgress
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-550 shrink-0 cursor-wait"
                            : lastSavedDeckId === deck.id
                              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                              : "bg-[#161618] hover:bg-white/5 border-amber-500/30 text-[#F59E0B]"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 leading-none">
                          <Save className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {saveInProgress
                              ? "Сохранение презентации в облаке..."
                              : lastSavedDeckId === deck.id
                                ? "Сохранено в облако DECKSY"
                                : "Сохранить изменения в БД"}
                          </span>
                        </div>
                        {lastSavedDeckId === deck.id && (
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 rounded uppercase font-mono font-bold leading-none py-0.5">
                            Синхронизировано
                          </span>
                        )}
                      </button>
                    )}
                    
                    {/* PPTX trigger download button */}
                    <button
                      id="export-pptx-btn"
                      onClick={handleDownloadPPTX}
                      className="w-full bg-white text-black hover:bg-slate-200 font-extrabold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between cursor-pointer transition-all"
                    >
                      <span>Скачать презентацию PPTX (Widescreen)</span>
                      {!isWatermarkRemoved && <span className="text-[8px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1 rounded uppercase font-bold">Watermark</span>}
                    </button>

                    {/* PDF print trigger  */}
                    <button
                      id="print-pdf-btn"
                      onClick={handleDownloadPDF}
                      className="w-full bg-[#161618] hover:bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-slate-200 cursor-pointer transition-all"
                    >
                      <span>Скачать презентацию PDF</span>
                      {!isWatermarkRemoved && <span className="text-[8px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1 rounded uppercase font-bold">Watermark</span>}
                    </button>

                    {/* Link developer sharing button with alert feedback */}
                    <button
                      id="share-deck-link-btn"
                      onClick={handleShareDeck}
                      className="w-full bg-[#161618] hover:bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-slate-200 cursor-pointer transition-all"
                    >
                      <span>Поделиться ссылкой с инвестором</span>
                    </button>

                    {/* JPEG ZIP trigger */}
                    <button
                      id="download-jpeg-zip-btn"
                      onClick={handleDownloadZIP}
                      className="w-full bg-[#161618] hover:bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-slate-200 cursor-pointer transition-all"
                    >
                      <span>Скачать архив JPEG-картинок (ZIP)</span>
                      <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-bold">100% Reliable</span>
                    </button>

                    {/* Python pptx script download */}
                    <button
                      id="download-python-script-btn"
                      onClick={handleDownloadPythonScript}
                      className="w-full bg-[#161618] hover:bg-slate-900 border border-[#3b82f6]/20 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-blue-400 cursor-pointer transition-all"
                    >
                      <span>Получить код Python (python-pptx)</span>
                      <span className="text-[8px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded uppercase font-bold">Python Code</span>
                    </button>

                  </div>

                  {shareSuccess && (
                     <div className="p-2.5 bg-green-950/20 border border-green-500/30 rounded text-[10px] text-green-400 font-mono text-center uppercase tracking-wider">
                       Ссылка скопирована в буфер обмена!
                     </div>
                  )}
                </div>

                {/* THE VC ROAST BUTTON PANEL (Очень важная фича) */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-xl">
                  
                  {!roastActive ? (
                    <div className="text-center space-y-3.5 py-2">
                      <div className="h-10 w-10 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Жесткий инвесторский Roast?</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">Получите разгромную и честную критику слабых мест вашего стартапа, чтобы защитить проект от реальных скептиков.</p>
                      </div>
                      <button
                        id="start-roast-btn"
                        onClick={() => {
                          setRoastActive(true);
                          setRoasted(true);
                        }}
                        className="w-full bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 font-extrabold uppercase tracking-widest text-[9px] py-3 px-4 rounded-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Flame className="h-3.5 w-3.5 animate-pulse" />
                        <span>Начать разгром</span>
                      </button>
                    </div>
                  ) : (
                    deck.roast && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4 text-left"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <h4 className="text-[9px] uppercase font-mono text-red-400 font-extrabold tracking-wider flex items-center space-x-1.5 font-bold">
                            <Flame className="h-3.5 w-3.5" />
                            <span>Критика ИИ-Инвестора (ROASTED)</span>
                          </h4>
                          <button 
                            onClick={() => setRoastActive(false)}
                            className="text-[9px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-300 font-mono"
                          >
                            Свернуть
                          </button>
                        </div>

                        {/* Circular Score and Verdict */}
                        <div className="bg-black/40 p-4 rounded border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-[#475569] uppercase font-mono tracking-widest">ВЕРДИКТ ИНВЕСТОРА:</span>
                            <h5 className="text-xs font-bold text-red-500 uppercase font-sans mt-0.5">{deck.roast.verdict}</h5>
                          </div>
                          
                          {/* Circle Progress bar gauge */}
                          <div className="relative h-12 w-12 flex-shrink-0">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                              <circle 
                                cx="18" cy="18" r="16" fill="none" 
                                className="stroke-red-500" 
                                strokeWidth="3" 
                                strokeDasharray={`${deck.roast.score}, 100`} 
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-red-500">
                              {deck.roast.score}%
                            </span>
                          </div>
                        </div>

                        {/* Roast brutal speech text */}
                        <p className="text-xs text-slate-355 italic leading-relaxed bg-red-950/10 border-l border-red-500 pl-3.5 py-1.5 font-sans">
                          {deck.roast.roastText}
                        </p>

                        {/* Weak Spots */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-red-400 uppercase font-mono tracking-widest flex items-center space-x-1 font-extrabold">
                            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                            <span>Красные флаги проекта:</span>
                          </span>
                          <ul className="text-[10px] text-slate-400 space-y-1 bg-black/30 p-3 rounded border border-white/5">
                            {deck.roast.weakSpots.map((spot, sIdx) => (
                              <li key={sIdx} className="flex items-start">
                                <span className="text-red-500 mr-2 font-bold">•</span>
                                <span>{spot}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Recommendations on how to solve */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-green-500 uppercase font-mono tracking-widest flex items-center space-x-1 font-extrabold">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            <span>План устранения уязвимостей:</span>
                          </span>
                          <ul className="text-[10px] text-slate-400 space-y-1 bg-black/30 p-3 rounded border border-white/5">
                            {deck.roast.recommendations.map((rec, rIdx) => (
                              <li key={rIdx} className="flex items-start">
                                <span className="text-green-500 mr-2 font-bold">✓</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </motion.div>
                    )
                  )}

                </div>

              </div>

            </div>

          </motion.div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6 bg-[#0D0D0F] text-center font-mono text-[10px] text-slate-500 uppercase tracking-wider">
        <p>© 2026 Decksy AI • Умный венчурный симулятор и конструктор питч-деков.</p>
        <nav className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px]">
          <a className="hover:text-slate-300 transition-colors" href="/offer">Оферта</a>
          <a className="hover:text-slate-300 transition-colors" href="/privacy">Политика конфиденциальности</a>
          <a className="hover:text-slate-300 transition-colors" href="/contacts">Контакты</a>
          <a className="hover:text-slate-300 transition-colors" href="/refunds">Возвраты</a>
          <a className="hover:text-slate-300 transition-colors" href="/service-delivery">Получение услуги</a>
        </nav>
        <p className="text-[9px] mt-2 text-slate-700 font-normal">Разработано с заботой о фаундерах и чистой юнит-экономике.</p>
      </footer>

      </div>

      {/* EXPORTING LOADING OVERLAY */}
      <AnimatePresence>
        {exportState && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-y-4 max-w-sm"
            >
              <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-[#10b981] animate-spin absolute" />
                <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse animate-duration-1000" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Снимок презентации высокой четкости...
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Слайд {exportState.current} из {exportState.total} ({Math.round((exportState.current / exportState.total) * 100)}%)
                </p>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-[#10b981] h-full transition-all duration-300"
                  style={{ width: `${(exportState.current / exportState.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                Мы создаем точную копию Apple iOS bento дизайна прямо с экрана, сохраняем векторные шрифты, цвета, границы и укладываем их в готовый файл {exportState.type.toUpperCase()}.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIGH-FIDELITY ACTIVE FRAME VIEWPORT DRAW NODE */}
      {exportSlideIndex !== null && deck && (() => {
        const isExpLight = selectedStyle === 'clean-light';
        const isExpCobalt = selectedStyle === 'cobalt';
        const isExpTitle = exportSlideIndex === 0 || (deck.slides[exportSlideIndex]?.type === 'title');

        let expBackground = 'linear-gradient(to bottom, #111115, #070709)';
        let expBorder = '1px solid rgba(255, 255, 255, 0.12)';
        let expTextColor = '#f8fafc';
        let expHeaderSpanColor = '#ffffff';
        let expHeaderBorder = '1px solid rgba(255, 255, 255, 0.06)';
        let expFooterBorder = '1px solid rgba(255, 255, 255, 0.06)';
        let expGridColor = 'radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px)';

        if (isExpLight) {
          expBackground = 'linear-gradient(to bottom, #ffffff, #f8fafc)';
          expBorder = '1px solid #e2e8f0';
          expTextColor = '#171717';
          expHeaderSpanColor = '#171717';
          expHeaderBorder = '1px solid #e2e8f0';
          expFooterBorder = '1px solid #e2e8f0';
          expGridColor = 'radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px)';
        } else if (isExpCobalt) {
          if (isExpTitle) {
            expBackground = 'linear-gradient(to bottom right, #004de6, #002db3)';
            expBorder = '1px solid rgba(255, 255, 255, 0.15)';
            expTextColor = '#ffffff';
            expHeaderSpanColor = '#ffffff';
            expHeaderBorder = '1px solid rgba(255, 255, 255, 0.1)';
            expFooterBorder = '1px solid rgba(255, 255, 255, 0.1)';
            expGridColor = 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)';
          } else {
            expBackground = 'linear-gradient(to bottom, #ffffff, #f5f9ff)';
            expBorder = '1px solid rgba(0, 77, 230, 0.15)';
            expTextColor = '#0f172a';
            expHeaderSpanColor = '#004de6';
            expHeaderBorder = '1px solid rgba(0, 77, 230, 0.08)';
            expFooterBorder = '1px solid rgba(0, 77, 230, 0.08)';
            expGridColor = 'radial-gradient(rgba(0, 77, 230, 0.015) 1px, transparent 1px)';
          }
        }

        return (
          <div
            id="export-active-slide-node"
            className="font-sans antialiased text-slate-100"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: `${EXPORT_SLIDE_WIDTH}px`,
              height: `${EXPORT_SLIDE_HEIGHT}px`,
              background: expBackground,
              border: expBorder,
              padding: '44px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              color: expTextColor,
              zIndex: 40,
              pointerEvents: 'none'
            }}
          >
            {/* Decorative background grid pattern */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: expGridColor,
                backgroundSize: '16px 16px',
                pointerEvents: 'none'
              }}
            />

            {/* Head line badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: expHeaderBorder, paddingBottom: '12px', fontSize: '13px', fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', position: 'relative', zIndex: 10 }}>
              <span style={{ color: expHeaderSpanColor, fontWeight: 600 }}>{deck.title}</span>
              <span>СЛАЙД {exportSlideIndex + 1} ИЗ {deck.slides.length}</span>
            </div>

            {/* Centered actual layout content inside */}
            <div className="font-sans" style={{ margin: 'auto 0', position: 'relative', zIndex: 10, height: '74%', display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
              {renderSlideContent(deck.slides[exportSlideIndex], exportSlideIndex, true)}
            </div>

            {/* Bottom footer bar */}
            <div style={{ borderTop: expFooterBorder, paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', position: 'relative', zIndex: 10 }}>
              <span>© {deck.title} • Seed Round</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ display: 'inline-block', height: '6px', width: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                {isWatermarkRemoved ? `Проект: ${deck.title}` : "Сгенерировано Decksy.ai"}
              </span>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
