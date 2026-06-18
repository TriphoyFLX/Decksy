import React, { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Briefcase, 
  ShieldCheck, 
  Calculator, 
  Server, 
  Globe, 
  FileText, 
  Lock, 
  Zap, 
  Check, 
  CreditCard,
  Loader2,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
  role?: string;
  isPro?: boolean;
  plan?: string;
  planExpiresAt?: string | null;
  monthlyDeckCount?: number;
  monthlyDeckLimit?: number;
  monthlyDeckResetAt?: string | null;
}

interface SubscriptionPlansProps {
  user: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenAuth: () => void;
  onBackToGenerator: () => void;
}

const PLAN_RANK: Record<string, number> = {
  Free: 0,
  Base: 1,
  Middle: 2,
  Pro: 3,
};

const getPlanRank = (plan?: string | null) => PLAN_RANK[plan || "Free"] ?? PLAN_RANK.Free;

export function SubscriptionPlans({ user, onUpdateUser, onOpenAuth, onBackToGenerator }: SubscriptionPlansProps) {
  // Navigation tabs in this billing/finances screen
  const [activeSubTab, setActiveSubTab] = useState<'tariffs' | 'economics' | 'calculator'>('tariffs');

  // Slider or value states for the interactive break-even simulator
  const [simBaseUsers, setSimBaseUsers] = useState<number>(3);
  const [simMiddleUsers, setSimMiddleUsers] = useState<number>(2);
  const [simProUsers, setSimProUsers] = useState<number>(1);

  // YooKassa state variables
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<string | null>(null);
  const [upgradePrice, setUpgradePrice] = useState<number>(0);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState<string>("");

  const [yookassaShopId, setYookassaShopId] = useState("");
  const [isTestMode, setIsTestMode] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState<boolean>(false);
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  const fetchUserMe = async () => {
    const token = localStorage.getItem("decksy_token");
    if (!token) return;
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          onUpdateUser(data.user);
        }
      }
    } catch (e) {
      console.error("Failed to fetch user after subscription upgrade", e);
    }
  };

  const fetchYooKassaStatus = async () => {
    const token = localStorage.getItem("decksy_token");
    if (!token || !user) return;
    try {
      const response = await fetch("/api/yookassa/status", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setYookassaShopId(data.shopId);
        setIsTestMode(data.isTest);
      }
    } catch (e) {
      console.error("Failed to fetch YooKassa system status", e);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    const token = localStorage.getItem("decksy_token");
    if (!token) return;
    setCheckingPayment(true);
    setErrorMessage("");
    setInfoMessage("Проверяем зачисление оплаты в ЮKassa...");
    try {
      const response = await fetch(`/api/yookassa/check-payment/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === "succeeded") {
          setPaymentSuccess(true);
          setInfoMessage(`Платёж успешно зачислен! Активирован тарифный план «${data.tariffId}». Спасибо за доверие! 🎉`);
          localStorage.removeItem("decksy_last_payment_id");
          await fetchUserMe();
          setTimeout(() => {
            setInfoMessage("");
            setPaymentSuccess(false);
          }, 6000);
        } else if (data.status === "pending") {
          setInfoMessage("Платёж ожидает оплаты. Если вы уже оплатили в ЮKassa, подождите несколько секунд и обновите вкладку.");
        } else {
          setErrorMessage(`Статус платежа: ${data.status}. Пожалуйста, попробуйте повторить платёж.`);
          localStorage.removeItem("decksy_last_payment_id");
        }
      } else {
        throw new Error(data.error || "Не удалось проверить актуальный статус платежа.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ошибка опроса платежного интерфейса.");
    } finally {
      setCheckingPayment(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchYooKassaStatus();
    }
  }, [user]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_check") === "1") {
      // Clean query parameter from URL bar
      window.history.replaceState({}, document.title, window.location.pathname + (window.location.hash || ""));
      const savedId = localStorage.getItem("decksy_last_payment_id");
      if (savedId) {
        checkPaymentStatus(savedId);
      } else {
        setInfoMessage("Вернулись с ЮKassa, но сохраненного идентификатора платежа не обнаружено.");
      }
    }
  }, []);

  const handleYooKassaPaySubmit = async () => {
    if (!selectedPlanForUpgrade) return;
    
    setIsPaying(true);
    setErrorMessage("");
    setInfoMessage("");
    setConfirmationUrl(null);
    setActivePaymentId(null);
    
    const token = localStorage.getItem("decksy_token");
    if (!token) {
      setErrorMessage("Сессия не найдена. Войдите в аккаунт заново.");
      setIsPaying(false);
      return;
    }
    
    try {
      const response = await fetch("/api/yookassa/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tariffId: selectedPlanForUpgrade })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка инициализации платежа в ЮKassa.");
      }
      
      if (data.success && data.paymentId) {
        localStorage.setItem("decksy_last_payment_id", data.paymentId);
        setActivePaymentId(data.paymentId);
        
        if (data.confirmationUrl) {
          setConfirmationUrl(data.confirmationUrl);
          // Try to open it in a new tab safely
          window.open(data.confirmationUrl, "_blank", "noopener,noreferrer");
        } else if (data.status === "succeeded") {
          setPaymentSuccess(true);
          await fetchUserMe();
          setTimeout(() => {
            setSelectedPlanForUpgrade(null);
            setPaymentSuccess(false);
          }, 3000);
        } else {
          throw new Error("Не найдена ссылка редиректа оплаты confirmationUrl.");
        }
      } else {
        throw new Error("Неверный формат ответа от сервера.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ошибка подключения к платежному шлюзу.");
    } finally {
      setIsPaying(false);
    }
  };



  const plansList = [
    {
      id: "Free",
      name: "Free",
      price: "0 ₽",
      perMonth: "",
      desc: "Для базового ознакомления",
      features: [
        "1 презентация в месяц",
        "1 тема оформления",
        "Водяной знак Decksy",
        "Без редактирования слайдов",
      ],
      color: "border-white/10 text-slate-400 bg-white/[0.01]",
      buttonText: "Текущий тариф",
    },
    {
      id: "Base",
      name: "Базовый",
      price: "149 ₽",
      perMonth: "/мес",
      desc: "Оптимален для точечной работы",
      features: [
        "До 5 презентаций в месяц",
        "2 темы оформления",
        "Возможность менять слайды",
        "Водяной знак Decksy",
      ],
      color: "border-sky-500/30 text-sky-400 bg-sky-950/10",
      buttonText: "Выбрать Базовый",
    },
    {
      id: "Middle",
      name: "Миддл",
      price: "299 ₽",
      perMonth: "/мес",
      desc: "Полноценный контент и экспорт",
      features: [
        "До 15 презентаций в месяц",
        "3 темы оформления",
        "Добавление графиков/картинок",
        "Возможность менять слайды",
        "Без водяного знака Decksy",
      ],
      color: "border-indigo-500/45 text-indigo-400 bg-indigo-950/15 ring-1 ring-indigo-500/20",
      buttonText: "Выбрать Миддл",
      popular: true,
    },
    {
      id: "Pro",
      name: "Проф",
      price: "499 ₽",
      perMonth: "/мес",
      desc: "Для серийных стартаперов",
      features: [
        "До 30 презентаций в месяц",
        "5 тем оформления",
        "Кастомные стили под запрос",
        "Добавление графиков/картинок",
        "Возможность менять слайды",
        "Без водяного знака Decksy",
      ],
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/15",
      buttonText: "Выбрать Проф",
    }
  ];

  // Calculations for break-even
  const monthlyFixedServerCost = 810;
  const monthlyFixedApiCost = 750;
  const totalMonthlyFixedCost = monthlyFixedServerCost + monthlyFixedApiCost; // 1560 ₽

  // Variable costs
  const baseCostPerPres = 5;

  const totalSimBaseRevenue = simBaseUsers * 149;
  const totalSimMiddleRevenue = simMiddleUsers * 299;
  const totalSimProRevenue = simProUsers * 499;
  const totalSimRevenue = totalSimBaseRevenue + totalSimMiddleRevenue + totalSimProRevenue;

  // Maximum presentation counts used in variable cost calculations
  const simBasePresCost = simBaseUsers * 5 * baseCostPerPres; // 5 presentations each
  const simMiddlePresCost = simMiddleUsers * 15 * baseCostPerPres; // 15 presentations each
  const simProPresCost = simProUsers * 30 * baseCostPerPres; // 30 presentations each
  const totalSimVariableCost = simBasePresCost + simMiddlePresCost + simProPresCost;

  const totalSimExpenses = totalMonthlyFixedCost + totalSimVariableCost;
  const totalSimProfit = totalSimRevenue - totalSimExpenses;

  // Percentage of physical fixed cost covered by current revenue simulator
  const fixedCostCoveragePct = Math.min(100, Math.round((totalSimRevenue / totalMonthlyFixedCost) * 100));

  const handleSelectPlan = (planId: string, priceStr: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (user.plan === planId) {
      return; // Already on this plan
    }

    if (getPlanRank(planId) <= getPlanRank(user.plan)) {
      setErrorMessage("Понижение тарифа недоступно. Для изменения подписки обратитесь в поддержку.");
      return;
    }

    // Set plan to purchase and open model
    const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ""));
    setSelectedPlanForUpgrade(planId);
    setUpgradePrice(priceNum);
    setErrorMessage("");
    setPaymentSuccess(false);
  };

  const processPlanChange = async (targetPlan: string) => {
    try {
      const response = await fetch("/api/auth/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("decksy_token")}`
        },
        body: JSON.stringify({ plan: targetPlan })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка при обновлении подписки.");
      }

      onUpdateUser(data.user);
      return true;
    } catch (err: any) {
      setErrorMessage(err.message || "Сбой связи с сервером.");
      return false;
    }
  };



  return (
    <motion.div 
      id="screen-plans"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6 pb-20 pt-4"
    >
      {/* Upper Action Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-sky-500/20 border border-purple-500/30 px-3 py-1 rounded-full text-purple-300 text-[9.5px] font-mono uppercase font-bold tracking-widest">
            ✦ ТАРИФЫ & ЮНИТ-ЭКОНОМИКА DECKSY
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white uppercase">
            Монетизация и Экономика Сервиса
          </h2>
        </div>

        <button 
          onClick={onBackToGenerator}
          className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase text-sky-400 hover:text-sky-300 transition-colors bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-lg cursor-pointer"
        >
          <span>← Вернуться к генерации</span>
        </button>
      </div>

      {/* Screen Sub Tabs */}
      <div className="flex border-b border-white/5 gap-1.5">
        <button
          onClick={() => setActiveSubTab('tariffs')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 font-mono transition-all cursor-pointer ${
            activeSubTab === 'tariffs' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📦 ТАРИФНЫЕ ПЛАНЫ
        </button>
        <button
          onClick={() => setActiveSubTab('economics')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 font-mono transition-all cursor-pointer ${
            activeSubTab === 'economics' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📈 РАСХОДЫ И ЮНИТ-АНАЛИЗ
        </button>
        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 font-mono transition-all cursor-pointer ${
            activeSubTab === 'calculator' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🧮 ИНТЕРАКТИВНЫЙ СИМУЛЯТОР БЕЗУБЫТОЧНОСТИ
        </button>
      </div>

      {/* Screen Body Component Switching */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'tariffs' && (
          <motion.div
            key="tariffs-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* Header / Sub-notice */}
            <div className="bg-[#121214] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="space-y-1 max-w-2xl">
                <p className="text-xs text-slate-350 leading-relaxed">
                  Купив платный тариф Decksy, вы не только снимаете ограничения, разблокируете редактор и водяные знаки, но и вносите вклад в масштабирование ИИ-инфраструктуры приложения.
                </p>
                {user ? (
                  <div className="space-y-1 text-xs text-sky-400 font-mono mt-1 pt-1">
                    <div className="inline-flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Ваш статус: <strong className="text-white bg-sky-950 border border-sky-800/40 px-2 py-0.5 rounded uppercase text-[10px]">{user.plan || "Free"}</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Генерации: <strong className="text-slate-200">{user.monthlyDeckCount ?? 0}</strong>
                      {" / "}
                      <strong className="text-slate-200">{Number.isFinite(user.monthlyDeckLimit) ? user.monthlyDeckLimit : "∞"}</strong>
                      {user.monthlyDeckResetAt && (
                        <span> · сброс {new Date(user.monthlyDeckResetAt).toLocaleDateString("ru")}</span>
                      )}
                      {user.planExpiresAt && (
                        <span> · тариф до {new Date(user.planExpiresAt).toLocaleDateString("ru")}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-mono">
                    💡 Войдите в систему, чтобы привязать подписку к аккаунту и убрать водяные знаки.
                  </p>
                )}
              </div>

              {!user && (
                <button
                  onClick={onOpenAuth}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase text-[10.5px] tracking-widest px-4.5 py-2.5 rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  Войти / Регистрация
                </button>
              )}
            </div>

            {/* Grid of plans */}
            <div className="grid md:grid-cols-4 gap-4 pt-1">
              {plansList.map((p) => {
                const isActive = user?.plan === p.id || (!user && p.id === "Free");
                const isLowerTier = Boolean(user && getPlanRank(p.id) < getPlanRank(user.plan));
                const isDisabled = isActive || isLowerTier;
                return (
                  <div 
                    key={p.id} 
                    className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] ${p.color} ${
                      isActive ? "ring-2 ring-purple-500 bg-purple-950/10 border-purple-500/40" : ""
                    }`}
                  >
                    {/* Popular Badge */}
                    {p.popular && (
                      <span className="absolute -top-2.5 right-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">
                        ✦ POPULAR
                      </span>
                    )}

                    {/* Active Badge */}
                    {isActive && (
                      <span className="absolute -top-2.5 left-6 bg-purple-600 text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">
                        АКТИВЕН
                      </span>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">{p.name}</h4>
                        <p className="text-[10px] text-slate-450 text-slate-400 font-sans h-6">{p.desc}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-mono font-black text-white">{p.price}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{p.perMonth}</span>
                      </div>

                      <span className="block border-t border-white/5 py-1" />

                      <ul className="space-y-2 text-left">
                        {p.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[10.5px]">
                            <span className="mt-1 flex-shrink-0">
                              {f.includes("Без") ? (
                                <Lock className="h-3 w-3 text-red-400" />
                              ) : (
                                <Check className="h-3 w-3 text-emerald-400" />
                              )}
                            </span>
                            <span className={f.includes("Без") ? "text-slate-500" : "text-slate-300"}>
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleSelectPlan(p.id, p.price)}
                        disabled={isDisabled}
                        className={`w-full py-2.5 rounded-xl font-mono text-[10.5px] tracking-widest uppercase transition-all duration-300 font-extrabold cursor-pointer border ${
                          isDisabled
                            ? "bg-white/5 border-white/5 text-slate-500 cursor-not-allowed"
                            : "bg-white text-black border-transparent hover:bg-slate-200"
                        }`}
                      >
                        {isActive ? "Активный тариф" : isLowerTier ? "Ниже текущего" : p.buttonText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Pricing note */}
            <div className="p-3.5 bg-yellow-950/10 border border-yellow-500/10 rounded-xl flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-normal">
                При повышении тарифа новый месячный лимит презентаций зачисляется после подтверждения оплаты. Понижение тарифа недоступно из интерфейса и API; для изменения подписки обратитесь в поддержку.
              </p>
            </div>
          </motion.div>
        )}

        {/* Expenses & Unit Economics Tab */}
        {activeSubTab === 'economics' && (
          <motion.div
            key="economics-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* Costs layout detail */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Startup expenditures card */}
              <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-violet-400">
                  <Briefcase className="h-5 w-5" />
                  <h3 className="text-sm font-bold tracking-wider font-mono uppercase">🚀 Стартовые затраты (Капитал)</h3>
                </div>
                
                <p className="text-xs text-slate-400">
                  Базовая сумма инвестиций, необходимая для запуска прототипа и вывода MVP сервиса в продакшен.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-slate-450 text-slate-400 flex items-center gap-1.5 font-sans"><Globe className="h-3.5 w-3.5 text-slate-500" />Регистрация домена .RU</span>
                    <span className="font-mono text-white font-bold">169 ₽</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-slate-450 text-slate-400 flex items-center gap-1.5 font-sans"><Server className="h-3.5 w-3.5 text-slate-500" />Старт облака на первый тестовый день</span>
                    <span className="font-mono text-white font-bold">27 ₽</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-slate-450 text-slate-400 flex items-center gap-1.5 font-sans"><Cpu className="h-3.5 w-3.5 text-slate-500" />Базовый баланс API нейросети</span>
                    <span className="font-mono text-white font-bold">100 ₽</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-slate-450 text-slate-400 flex items-center gap-1.5 font-sans"><ShieldCheck className="h-3.5 w-3.5 text-slate-500" />SSL-сертификат безопасности</span>
                    <span className="font-mono text-emerald-400 font-bold">0 ₽ (Let's Encrypt)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 text-slate-100">
                    <strong className="font-mono uppercase text-xs tracking-wider">Всего капвложений (Итого)</strong>
                    <strong className="font-mono text-purple-450 text-purple-400 text-base">296 ₽</strong>
                  </div>
                </div>
              </div>

              {/* Monthly operational expenses card */}
              <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-rose-400">
                  <Server className="h-5 w-5" />
                  <h3 className="text-sm font-bold tracking-wider font-mono uppercase">💸 Ежемесячные OPEX расходы</h3>
                </div>

                <p className="text-xs text-slate-400">
                  Постоянные затраты сервиса Decksy для бесперебойного поддержания хостинга, бэкенда и рендеринг скриншотов.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-slate-450 text-slate-400 font-sans">Хостинг бэкенда & СУБД SQLite</span>
                    <span className="font-mono text-white font-bold">810 ₽/мес</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-slate-450 text-slate-400 font-sans">Потребительские API лимиты Deepskeek/V4 & Gemini</span>
                    <span className="font-mono text-white font-bold">~750 ₽/мес</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 text-slate-100">
                    <strong className="font-mono uppercase text-xs tracking-wider">Итого OPEX расхода</strong>
                    <strong className="font-mono text-rose-450 text-rose-400 text-base">~1 560 ₽/мес</strong>
                  </div>
                </div>

                <div className="bg-rose-950/10 border border-rose-500/10 p-2.5 rounded-lg">
                  <p className="text-[10px] text-slate-450 text-slate-405 leading-relaxed">
                    * Постоянные расходы не зависят от того, сколько людей заходят в сервис. Они окупаются за счет подписок.
                  </p>
                </div>
              </div>

            </div>

            {/* Unit Economics table */}
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
                <h3 className="text-sm font-bold tracking-wider font-mono uppercase">📊 Юнит-экономика одного юзера (Подписчика)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Себестоимость генерации и экспорта одной презентации заложена в бюджете как <span className="text-emerald-400 font-bold font-mono">5 ₽</span> (запросы к ИИ и кэширование картинок). Посмотрим маржинальность каждого тарифа при полной выгрузке лимита:
              </p>

              <div className="grid md:grid-cols-3 gap-4 pt-2">
                
                {/* Economy - Base */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[9.5px] font-mono tracking-widest text-sky-400 uppercase font-bold bg-sky-950/30 border border-sky-850/45 px-2 py-0.5 rounded">ТАРИФ БАЗОВЫЙ</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Лимит презентаций</span>
                      <span className="text-white font-mono font-bold">5 шт</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pb-1.5 border-b border-white/5">
                      <span>Себестоимость (5 × 5 ₽)</span>
                      <span className="text-rose-400 font-mono font-bold">25 ₽</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                      <span>Доход (Стоимость)</span>
                      <span className="text-white font-mono font-bold">149 ₽</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-white/5 text-slate-200">
                      <strong>Валовая Маржа</strong>
                      <strong className="text-emerald-400 font-mono text-sm">124 ₽</strong>
                    </div>
                  </div>
                </div>

                {/* Economy - Middle */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[9.5px] font-mono tracking-widest text-indigo-400 uppercase font-bold bg-indigo-950/30 border border-indigo-850/45 px-2 py-0.5 rounded">ТАРИФ МИДДЛ</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Лимит презентаций</span>
                      <span className="text-white font-mono font-bold">15 шт</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pb-1.5 border-b border-white/5">
                      <span>Себестоимость (15 × 5 ₽)</span>
                      <span className="text-rose-400 font-mono font-bold">75 ₽</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                      <span>Доход (Стоимость)</span>
                      <span className="text-white font-mono font-bold">299 ₽</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-white/5 text-slate-200">
                      <strong>Валовая Маржа</strong>
                      <strong className="text-emerald-400 font-mono text-sm">224 ₽</strong>
                    </div>
                  </div>
                </div>

                {/* Economy - Pro */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[9.5px] font-mono tracking-widest text-emerald-400 uppercase font-bold bg-emerald-950/30 border border-emerald-850/45 px-2 py-0.5 rounded">ТАРИФ ПРОФ</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Лимит презентаций</span>
                      <span className="text-white font-mono font-bold">30 шт</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pb-1.5 border-b border-white/5">
                      <span>Себестоимость (30 × 5 ₽)</span>
                      <span className="text-rose-400 font-mono font-bold">150 ₽</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                      <span>Доход (Стоимость)</span>
                      <span className="text-white font-mono font-bold">499 ₽</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-white/5 text-slate-200">
                      <strong>Валовая Маржа</strong>
                      <strong className="text-emerald-400 font-mono text-sm">349 ₽</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* Break-even point Interactive Simulator */}
        {activeSubTab === 'calculator' && (
          <motion.div
            key="calculator-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-6">
              
              {/* Top description */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Calculator className="h-5 w-5" />
                  <h3 className="text-sm font-bold tracking-wider font-mono uppercase">🎯 Калькулятор Покрытия Постоянных OPEX Расходов</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Наш серверный расход составляет <span className="text-white font-mono font-bold">~1 560 ₽</span> ежемесячно. Двигайте ползунки симуляции подписчиков, чтобы узнать, когда Decksy выходит в чистый плюс!
                </p>
              </div>

              {/* Sliders layout */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                
                {/* Control sliders */}
                <div className="space-y-5 bg-black/30 p-5 rounded-xl border border-white/5">
                  <h4 className="text-xs font-mono font-bold text-slate-350 tracking-wider uppercase mb-1">Симуляция подписчиков</h4>
                  
                  {/* Slider 1: Base */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-sky-400">Базовый (149 ₽):</span>
                      <span className="text-white font-extrabold">{simBaseUsers} чел</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={simBaseUsers}
                      onChange={(e) => setSimBaseUsers(parseInt(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer h-1.5 rounded-lg bg-white/10"
                    />
                    <span className="block text-[9px] text-slate-500 font-mono text-right">+ {simBaseUsers * 149} ₽</span>
                  </div>

                  {/* Slider 2: Middle */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-indigo-400">Миддл (299 ₽):</span>
                      <span className="text-white font-extrabold">{simMiddleUsers} чел</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={simMiddleUsers}
                      onChange={(e) => setSimMiddleUsers(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg bg-white/10"
                    />
                    <span className="block text-[9px] text-slate-500 font-mono text-right">+ {simMiddleUsers * 299} ₽</span>
                  </div>

                  {/* Slider 3: Pro */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-emerald-400">Проф (499 ₽):</span>
                      <span className="text-white font-extrabold">{simProUsers} чел</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={simProUsers}
                      onChange={(e) => setSimProUsers(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg bg-white/10"
                    />
                    <span className="block text-[9px] text-slate-500 font-mono text-right">+ {simProUsers * 499} ₽</span>
                  </div>
                </div>

                {/* Calculation Screen / Outputs */}
                <div className="space-y-4">
                  <div className="bg-black/50 border border-white/5 rounded-xl p-5 space-y-3 font-mono">
                    
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Симулированная Выручка:</span>
                      <span className="text-white font-semibold">{totalSimRevenue} ₽/мес</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Фиксированные OPEX расходы:</span>
                      <span className="text-[#bfdbfe]">{totalMonthlyFixedCost} ₽/мес</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Переменные затраты (ИИ):</span>
                      <span className="text-rose-350 text-rose-350 text-rose-450 text-rose-400">-{totalSimVariableCost} ₽</span>
                    </div>

                    <div className="border-t border-white/5 py-1" />

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold uppercase tracking-wider text-xs">Чистая Прибыль:</span>
                      <strong className={`text-base font-black ${totalSimProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {totalSimProfit >= 0 ? `+${totalSimProfit}` : totalSimProfit} ₽/мес
                      </strong>
                    </div>

                  </div>

                  {/* Coverage Indicator */}
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Покрытие постоянных расходов (1 560 ₽)</span>
                      <span className={`${totalSimRevenue >= totalMonthlyFixedCost ? "text-emerald-400 font-bold" : "text-slate-400"}`}>{fixedCostCoveragePct}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          totalSimProfit >= 0 ? "bg-emerald-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${fixedCostCoveragePct}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal italic font-sans text-center md:text-left">
                    * Для безубыточности (без учета переменных затрат на ИИ) требуется ровно 11 Base-юзеров, либо 6 Middle-юзеров, либо 4 Pro-пользователя.
                  </p>
                </div>

              </div>

              {/* Theoretical static breakdown */}
              <div className="border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-450 text-slate-400 font-mono uppercase block">100% на Базовом</span>
                  <strong className="text-sm font-mono text-white mt-1 block">11 Пользователей</strong>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">Нужно для безубыточности</p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-450 text-slate-400 font-mono uppercase block">100% на Миддл</span>
                  <strong className="text-sm font-mono text-white mt-1 block">6 Пользователей</strong>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">Нужно для безубыточности</p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-450 text-slate-400 font-mono uppercase block">100% на Проф</span>
                  <strong className="text-sm font-mono text-white mt-1 block">4 Пользователя</strong>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">Нужно для безубыточности</p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURED CHECKOUT POPUP DIALOG FOR UPGRADES */}
      <AnimatePresence>
        {selectedPlanForUpgrade && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D0F] border border-white/10 w-full max-w-sm rounded-2xl p-6 relative overflow-hidden shadow-2xl space-y-4"
            >
              {/* YooKassa Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5 font-sans">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-300">Безопасная оплата ЮKassa</h3>
                </div>
                <button 
                  onClick={() => {
                    setSelectedPlanForUpgrade(null);
                    setConfirmationUrl(null);
                    setActivePaymentId(null);
                    setErrorMessage("");
                    setInfoMessage("");
                  }}
                  className="text-slate-500 hover:text-white font-mono text-xs"
                >
                  ✕
                </button>
              </div>

              {!paymentSuccess ? (
                <div className="space-y-4">
                  {confirmationUrl ? (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="h-10 w-10 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                          <Check className="h-5 w-5" />
                        </div>
                        <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-200">СЧЕТ УСПЕШНО СОЗДАН!</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Для завершения безопасной оплаты за тариф в новой вкладке нажмите кнопку ниже:
                        </p>
                      </div>

                      <div className="space-y-3">
                        <a
                          href={confirmationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/10 text-center uppercase"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Оплатить {upgradePrice} ₽ в ЮKassa ↗</span>
                        </a>

                        <button
                          onClick={() => {
                            if (activePaymentId) {
                              checkPaymentStatus(activePaymentId);
                            }
                          }}
                          disabled={checkingPayment}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-mono tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                        >
                          {checkingPayment ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                              <span>Проверяем status...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                              <span>Проверить зачисление оплаты</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-[#141416] border border-white/5 p-3 rounded-xl">
                        <p className="text-[9.5px] text-slate-500 leading-normal text-center font-sans">
                          После оплаты на защищенной странице ЮKassa вернитесь сюда и её статус обновится автоматически, либо нажмите кнопку проверки выше.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <h4 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider">АКТИВАЦИЯ ТАРИФА</h4>
                        <p className="text-sm font-mono font-black text-purple-400 uppercase tracking-wide">
                          «{plansList.find(p => p.id === selectedPlanForUpgrade)?.name}»
                        </p>
                        <div className="text-3xl font-bold text-white font-mono mt-1">{upgradePrice} ₽</div>
                        <p className="text-[10px] text-slate-500 font-sans">
                          Эквайринг предоставлен официальным шлюзом ЮKassa
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* Connection status banner info */}
                        <div className="bg-[#141416] border border-white/5 p-3 rounded-xl space-y-1.5 text-center">
                          <div className="flex items-center justify-center space-x-2 text-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-medium font-mono text-slate-300">
                              Магазин #{yookassaShopId || "1386669"}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                            Интеграция работает в {isTestMode ? "тестовом режиме" : "боевом режиме"}. ЮKassa откроется в новой надежной вкладке браузера для безопасности ваших данных.
                          </p>
                        </div>

                        {/* Major action button */}
                        <button
                          onClick={handleYooKassaPaySubmit}
                          disabled={isPaying}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                        >
                          {isPaying ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Создание счета в ЮKassa...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Перейти к оплате {upgradePrice} ₽ ↗</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <p className="text-[10px] text-red-400 font-mono bg-red-950/10 p-2 border border-red-500/25 rounded text-center">{errorMessage}</p>
                  )}

                  {infoMessage && (
                    <p className="text-[10px] text-emerald-400 font-mono bg-emerald-950/10 p-2 border border-emerald-500/25 rounded text-center">{infoMessage}</p>
                  )}

                  <div className="pt-2 border-t border-white/5 text-center">
                    <button
                      onClick={() => {
                        setSelectedPlanForUpgrade(null);
                        setConfirmationUrl(null);
                        setActivePaymentId(null);
                        setInfoMessage("");
                        setErrorMessage("");
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-sans uppercase tracking-wider"
                    >
                      {confirmationUrl ? "← Назад к тарифам" : "Закрыть окно платежа"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-950/20 border border-emerald-500/35 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white">Платёж зачислен!</h4>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Тариф успешно повышен. Приятного пользования!</p>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL NOTIFICATION BANNER (When checking payments passively) */}
      {(checkingPayment || infoMessage || errorMessage) && !selectedPlanForUpgrade && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0E0E12] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3 font-sans">
          <div className="flex items-center space-x-2">
            {checkingPayment ? (
              <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
            ) : errorMessage ? (
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            )}
            <h5 className="text-xs font-bold text-slate-200">Информация об оплате</h5>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {checkingPayment ? "Связываемся с серверами ЮKassa для проверки оплаты..." : infoMessage || errorMessage}
          </p>
          {!checkingPayment && (
            <button
              onClick={() => {
                setInfoMessage("");
                setErrorMessage("");
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase"
            >
              Скрыть
            </button>
          )}
        </div>
      )}

    </motion.div>
  );
}
