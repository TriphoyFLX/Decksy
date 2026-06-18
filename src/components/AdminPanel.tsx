import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  LineChart, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Plus, 
  Megaphone, 
  Eye, 
  EyeOff, 
  Lock, 
  ChevronRight, 
  Search,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Globe
} from "lucide-react";

interface UserData {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isPro: boolean;
  plan: string;
  planStartedAt?: string | null;
  planExpiresAt?: string | null;
  monthlyDeckCount?: number;
  monthlyDeckResetAt?: string | null;
  createdAt: string;
}

interface AdData {
  id: number;
  title: string;
  content: string;
  link: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

interface RequestLogData {
  id: number;
  path: string;
  method: string;
  createdAt: string;
}

interface Metrics {
  totalDecks: number;
  totalRequests: number;
  totalUsers: number;
  proUsers: number;
  activeAds: number;
  recentRequests: RequestLogData[];
}

interface AdminPanelProps {
  authToken: string | null;
  onBack: () => void;
  onSubscriptionChanged?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ authToken, onBack, onSubscriptionChanged }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'logs'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [ads, setAds] = useState<AdData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Ad form state
  const [adTitle, setAdTitle] = useState("");
  const [adContent, setAdContent] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adIsActive, setAdIsActive] = useState(true);
  const [adSubmitting, setAdSubmitting] = useState(false);

  // Delete confirmations (stores ID of user/ad currently confirming delete)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<number | null>(null);
  const [confirmDeleteAd, setConfirmDeleteAd] = useState<number | null>(null);

  // Load everything
  const loadAdminData = async () => {
    if (!authToken) {
      setError("Токен сессии отсутствует. Пожалуйста, авторизуйтесь.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch general metrics + request logs
      const metricsRes = await fetch("/api/admin/metrics", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      
      if (!metricsRes.ok) {
        throw new Error(metricsRes.status === 403 
          ? "Доступ запрещен. Вы не являетесь администратором." 
          : "ошибка загрузки метрик"
        );
      }
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // 2. Fetch users database
      const usersRes = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // 3. Fetch advertisements
      const adsRes = await fetch("/api/admin/ads", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Не удалось загрузить данные панели администратора.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [authToken]);

  // Flash success messages nicely
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  // Toggle user PRO / Subscription
  const handleTogglePro = async (userId: number, currentMail: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-pro`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка переключения подписки");

      // Update in-place local states from the server response to keep plan/isPro in sync.
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data.user } : u));
      if (metrics) {
        const proDiff = data.user.isPro ? 1 : -1;
        setMetrics({ ...metrics, proUsers: metrics.proUsers + proDiff });
      }

      triggerSuccess(data.message || `Статус PRO изменен для ${currentMail}`);
      
      // Notify parent to update visual premium state of logged in user instantly
      if (onSubscriptionChanged) {
        onSubscriptionChanged();
      }
    } catch (err: any) {
      alert("Не удалось обновить подписку: " + err.message);
    }
  };

  // Toggle admin rights
  const handleToggleRole = async (userId: number, currentMail: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-role`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка переключения роли");

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: data.user.role } : u));
      triggerSuccess(data.message || `Роль обновлена для ${currentMail}`);
    } catch (err: any) {
      alert("Не удалось изменить роль: " + err.message);
    }
  };

  // Delete active user profile
  const handleDeleteUser = async (userId: number, email: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка удаления");

      setUsers(prev => prev.filter(u => u.id !== userId));
      if (metrics) {
        setMetrics({ ...metrics, totalUsers: metrics.totalUsers - 1 });
      }

      triggerSuccess(`Учетная запись ${email} удалена.`);
      setConfirmDeleteUser(null);
    } catch (err: any) {
      alert("Не удалось удалить пользователя: " + err.message);
    }
  };

  // Toggle active status for advertisement
  const handleToggleAd = async (adId: number) => {
    try {
      const res = await fetch(`/api/admin/ads/${adId}/toggle`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка переключения статуса рекламы");

      setAds(prev => prev.map(a => a.id === adId ? { ...a, isActive: !a.isActive } : a));
      if (metrics) {
        const diff = data.ad.isActive ? 1 : -1;
        setMetrics({ ...metrics, activeAds: metrics.activeAds + diff });
      }

      triggerSuccess(data.message || "Статус рекламы изменен");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete advertisement slot
  const handleDeleteAd = async (adId: number) => {
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка удаления");

      setAds(prev => prev.filter(a => a.id !== adId));
      if (metrics && ads.find(a => a.id === adId)?.isActive) {
        setMetrics({ ...metrics, activeAds: Math.max(0, metrics.activeAds - 1) });
      }

      triggerSuccess("Рекламное объявление удалено.");
      setConfirmDeleteAd(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create new advertisement slot
  const handleAddAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adContent.trim()) {
      alert("Пожалуйста, заполните основные поля: заголовок и контент.");
      return;
    }

    setAdSubmitting(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: adTitle,
          content: adContent,
          link: adLink || null,
          imageUrl: adImageUrl || null,
          isActive: adIsActive
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка создания объявления");

      setAds(prev => [data.ad, ...prev]);
      if (metrics && data.ad.isActive) {
        setMetrics({ ...metrics, activeAds: metrics.activeAds + 1 });
      }

      triggerSuccess("Рекламная акция успешно запущена!");
      
      // Clear inputs
      setAdTitle("");
      setAdContent("");
      setAdLink("");
      setAdImageUrl("");
      setAdIsActive(true);
    } catch (err: any) {
      alert("Не удалось создать рекламу: " + err.message);
    } finally {
      setAdSubmitting(false);
    }
  };

  // Filter users database
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full bg-[#111113] rounded-md border border-white/10 p-6 sm:p-8 space-y-8 my-4"
    >
      {/* Header section with back option */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#FF5D44]/10 text-[#FF5D44] border border-[#FF5D44]/20 rounded-md">
              <Shield className="h-5 w-5 animate-pulse" />
            </span>
            <h1 className="text-xl sm:text-2xl font-sans font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Decksy AI <span className="text-[#FF5D44] text-xs font-mono font-black uppercase bg-[#FF5D44]/10 px-2 py-0.5 rounded border border-[#FF5D44]/30">ADMIN CENTRE</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Авторизованная контрольная панель системного трафика, рекламы и тарифов.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadAdminData}
            disabled={loading}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-sm cursor-pointer transition-colors flex items-center justify-center"
            title="Обновить метрики"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#FF5D44]' : ''}`} />
          </button>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[#161619] hover:bg-neutral-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-colors"
          >
            ← Воркспейс
          </button>
        </div>
      </div>

      {/* Response indicators */}
      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-sm flex items-start gap-2.5"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <strong className="block font-bold">ОШИБКА ДОСТУПА ИЛИ ЗАПРОСА:</strong>
              {error}
            </div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-3 rounded-sm flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="text-xs font-mono font-medium">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#161619] border border-white/5 p-4 rounded-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">ПОЛЬЗОВАТЕЛИ</span>
          <div className="text-2xl font-black font-mono text-white">
            {loading ? "..." : metrics?.totalUsers ?? 0}
          </div>
          <span className="text-[8px] font-mono text-[#FF5D44] block">Зарегистрировано в БД</span>
        </div>

        <div className="bg-[#161619] border border-white/5 p-4 rounded-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">ПРО СТАТУС</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {loading ? "..." : metrics?.proUsers ?? 0}
          </div>
          <span className="text-[8px] font-mono text-emerald-500/85 block">Активные подписки PRO</span>
        </div>

        <div className="bg-[#161619] border border-white/5 p-4 rounded-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">ПРЕЗЕНТАЦИИ</span>
          <div className="text-2xl font-black font-mono text-white">
            {loading ? "..." : metrics?.totalDecks ?? 0}
          </div>
          <span className="text-[8px] font-mono text-blue-400 block">Всего создано ИИ слайдов</span>
        </div>

        <div className="bg-[#161619] border border-white/5 p-4 rounded-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">API ТРАФИК</span>
          <div className="text-2xl font-black font-mono text-amber-500">
            {loading ? "..." : metrics?.totalRequests ?? 0}
          </div>
          <span className="text-[8px] font-mono text-amber-500/80 block">Всего обработано HTTP запросов</span>
        </div>

        <div className="bg-[#161619] border border-white/5 p-4 rounded-sm space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">РЕКЛАМА</span>
          <div className="text-2xl font-black font-mono text-[#FF5D44]">
            {loading ? "..." : metrics?.activeAds ?? 0}
          </div>
          <span className="text-[8px] font-mono text-red-400 block">Размещено промо-акций</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-white/10 gap-1 pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-sm transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent ${
            activeTab === 'users' 
              ? 'text-[#FF5D44] border-b-2 border-[#FF5D44]' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          👥 Управление Юзерами
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-sm transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent ${
            activeTab === 'ads' 
              ? 'text-[#FF5D44] border-b-2 border-[#FF5D44]' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="h-3.5 w-3.5" />
          📢 Рекламный Кабинет
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-sm transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent ${
            activeTab === 'logs' 
              ? 'text-[#FF5D44] border-b-2 border-[#FF5D44]' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LineChart className="h-3.5 w-3.5" />
          📈 График и Логи Трафика
        </button>
      </div>

      {/* Active Tab Panel Body */}
      <div className="min-h-[300px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-8 w-8 text-[#FF5D44] animate-spin" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Обработка системных таблиц...</span>
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            {activeTab === 'users' && (
              <motion.div 
                key="users-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по email, имени или роли..."
                    className="w-full bg-[#161619] border border-white/10 rounded-sm py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FF5D44] focus:border-transparent"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white bg-transparent border-none"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Users Database Table */}
                <div className="overflow-x-auto border border-white/5 rounded-sm">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#161619] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4 font-bold">ID</th>
                        <th className="py-3 px-4 font-bold">Профиль пользователя</th>
                        <th className="py-3 px-4 font-bold">Роль</th>
                        <th className="py-3 px-4 font-bold">Подписка</th>
                        <th className="py-3 px-4 font-bold text-right">Управление и права доступа</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            База данных пуста или совпадений по поиску не найдено.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isProtectedAdmin = u.role === "admin" && u.isPro;
                          return (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 text-slate-500">#{u.id}</td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-white">{u.name || "—"}</div>
                                <div className="text-[10px] text-slate-400 select-all" title={u.email}>{u.email}</div>
                                <div className="text-[8px] text-slate-600">Зарегистрирован {new Date(u.createdAt).toLocaleString("ru")}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                                  u.role === "admin" 
                                    ? "bg-red-500/10 text-[#FF5D44] border border-[#FF5D44]/30" 
                                    : "bg-slate-800 text-slate-300"
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                                  u.isPro 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                                    : "bg-slate-900 text-slate-600 border border-transparent"
                                }`}>
                                  {u.plan || (u.isPro ? "Pro" : "Free")}
                                </span>
                                <div className="text-[8px] text-slate-600 mt-1">
                                  {u.monthlyDeckCount ?? 0} генераций
                                  {u.planExpiresAt && ` · до ${new Date(u.planExpiresAt).toLocaleDateString("ru")}`}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Toggle PRO Button */}
                                  <button
                                    onClick={() => handleTogglePro(u.id, u.email)}
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-colors border-none ${
                                      u.isPro
                                        ? "bg-amber-950/40 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-black"
                                        : "bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black"
                                    }`}
                                    title={u.isPro ? "Забрать премиум доступ" : "Выдать премиум PRO доступ"}
                                  >
                                    {u.isPro ? "Revoke PRO" : "Grant PRO"}
                                  </button>

                                  {/* Toggle Admin Button */}
                                  {!isProtectedAdmin && (
                                    <button
                                      onClick={() => handleToggleRole(u.id, u.email)}
                                      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-colors border-none ${
                                        u.role === "admin"
                                          ? "bg-rose-950/40 text-[#FF5D44] border border-red-500/10 hover:bg-[#FF5D44] hover:text-white"
                                          : "bg-stone-900 text-stone-400 hover:bg-slate-300 hover:text-black"
                                      }`}
                                      title={u.role === "admin" ? "Сделать обычным пользователем" : "Сделать Администратором"}
                                    >
                                      Role
                                    </button>
                                  )}

                                  {/* Delete user */}
                                  {!isProtectedAdmin && (
                                    <>
                                      {confirmDeleteUser === u.id ? (
                                        <div className="flex items-center gap-1.5">
                                          <button 
                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                            className="px-2 py-1 bg-rose-600 text-white rounded-sm text-[10px] font-black uppercase tracking-wider cursor-pointer border-none"
                                          >
                                            Да, удалить
                                          </button>
                                          <button 
                                            onClick={() => setConfirmDeleteUser(null)}
                                            className="p-1 bg-white/5 text-slate-400 hover:text-white rounded-sm cursor-pointer border-none"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setConfirmDeleteUser(u.id)}
                                          className="p-1.5 bg-transparent text-slate-500 hover:text-red-400 rounded-sm cursor-pointer transition-colors border-none"
                                          title="Удалить пользователя из БД"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'ads' && (
              <motion.div 
                key="ads-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-none"
              >
                {/* Form to CREATE new advertisement banner */}
                <div className="lg:col-span-1 bg-[#161619] border border-white/15 p-5 rounded-sm h-fit space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-[#FF5D44]" />
                    Новая Рекламная Акция
                  </h3>

                  <form onSubmit={handleAddAdSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Заголовок промо</label>
                      <input
                        type="text"
                        required
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="Например: Скидка 50% на PRO или Инвест-форум"
                        className="w-full bg-[#111113] border border-white/10 rounded-sm p-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF5D44]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Содержание рекламы</label>
                      <textarea
                        required
                        rows={3}
                        value={adContent}
                        onChange={(e) => setAdContent(e.target.value)}
                        placeholder="Короткий привлекательный текст о предложении, продукте или встрече с инвесторами..."
                        className="w-full bg-[#111113] border border-white/10 rounded-sm p-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF5D44] resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block">Целевая ссылка (Link URL)</label>
                      <input
                        type="url"
                        value={adLink}
                        onChange={(e) => setAdLink(e.target.value)}
                        placeholder="https://example.com/promo"
                        className="w-full bg-[#111113] border border-white/10 rounded-sm p-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF5D44]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block">Ссылка на картинку (Image URL)</label>
                      <input
                        type="url"
                        value={adImageUrl}
                        onChange={(e) => setAdImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-[#111113] border border-white/10 rounded-sm p-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF5D44]"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 select-none">
                      <input
                        id="ad-active-checkbox"
                        type="checkbox"
                        checked={adIsActive}
                        onChange={(e) => setAdIsActive(e.target.checked)}
                        className="rounded border-[#FF5D44]/30 bg-[#111113] text-[#FF5D44] focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer h-3.5 w-3.5"
                      />
                      <label htmlFor="ad-active-checkbox" className="text-[11px] font-mono text-slate-300 font-medium cursor-pointer">
                        Запустить сразу после добавления
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={adSubmitting}
                      className="w-full py-2 bg-[#FF5D44] hover:bg-orange-600 text-white border-none font-bold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      {adSubmitting ? "Регистрация..." : "Создать Слоты"}
                    </button>
                  </form>
                </div>

                {/* List of current advertisement campaign slots */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Megaphone className="h-4 w-4 text-[#FF5D44]" />
                    Размещенные промо-акции ({ads.length})
                  </h3>

                  <div className="grid grid-cols-1 gap-3.5">
                    {ads.length === 0 ? (
                      <div className="border border-dashed border-white/10 text-center py-16 rounded-sm text-slate-500 font-mono text-xs">
                        Рекламные кампании пока не созданы. Опубликуйте объявление из левой формы.
                      </div>
                    ) : (
                      ads.map((ad) => (
                        <div 
                          key={ad.id} 
                          className={`bg-[#161619] border rounded-sm p-4.5 space-y-3 transition-colors ${
                            ad.isActive ? 'border-emerald-500/30' : 'border-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full animate-none ${ad.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                <h4 className="text-xs sm:text-sm font-bold text-white font-mono">{ad.title}</h4>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono ${
                                  ad.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {ad.isActive ? 'Активна — LIVE' : 'Приостановлена'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 font-sans font-medium mt-1 pr-6">{ad.content}</p>
                            </div>

                            <span className="text-[10px] font-mono text-slate-600 select-none">#{ad.id}</span>
                          </div>

                          {/* Media attachments */}
                          {(ad.link || ad.imageUrl) && (
                            <div className="flex flex-wrap gap-3 pt-1 text-[9px] font-mono text-slate-400">
                              {ad.imageUrl && (
                                <div className="flex items-center gap-1 text-slate-400 bg-white/5 py-0.5 px-2 rounded border border-white/5">
                                  <Globe className="h-3 w-3 text-blue-500" />
                                  Картинка: <span className="text-slate-300 truncate max-w-[150px]" title={ad.imageUrl}>{ad.imageUrl}</span>
                                </div>
                              )}
                              {ad.link && (
                                <a 
                                  href={ad.link} 
                                  target="_blank" 
                                  referrerPolicy="no-referrer"
                                  className="flex items-center gap-1 text-blue-400 bg-blue-950/20 py-0.5 px-2 rounded border border-blue-500/10 hover:underline"
                                >
                                  Ссылка: <span className="truncate max-w-[150px]">{ad.link}</span>
                                </a>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1.5 text-[10px] font-mono">
                            <span className="text-slate-500">Запуск: {new Date(ad.createdAt).toLocaleString("ru")}</span>

                            <div className="flex items-center gap-2">
                              {/* Toggle visibility */}
                              <button
                                onClick={() => handleToggleAd(ad.id)}
                                className={`px-2.5 py-1 text-[10px] font-bold uppercase cursor-pointer rounded-sm border-none transition-colors ${
                                  ad.isActive
                                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20"
                                }`}
                              >
                                {ad.isActive ? "Выключить" : "Включить класс"}
                              </button>

                              {/* Delete ad */}
                              {confirmDeleteAd === ad.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="px-2 py-1 bg-red-600 text-white rounded-sm text-[9px] font-black uppercase cursor-pointer border-none"
                                  >
                                    Удалить
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteAd(null)}
                                    className="p-1 text-slate-400 hover:text-white cursor-pointer bg-transparent border-none"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteAd(ad.id)}
                                  className="p-1 bg-transparent text-slate-500 hover:text-rose-400 cursor-pointer border-none"
                                  title="Удалить объявление"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div 
                key="logs-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 animate-pulse">
                    <LineChart className="h-4 w-4 text-[#FF5D44]" />
                    Мониторинг Системной Активности — Логи Трафика
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    Последние 15 Запросов
                  </span>
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-sm">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#161619] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4 font-bold">Индекс</th>
                        <th className="py-3 px-4 font-bold">Метод</th>
                        <th className="py-3 px-4 font-bold">Маршрут запроса (API Endpoint)</th>
                        <th className="py-3 px-4 font-bold text-right">Время Хита UTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {metrics?.recentRequests && metrics.recentRequests.length > 0 ? (
                        metrics.recentRequests.map((log, idx) => {
                          const isGet = log.method === "GET";
                          const isPost = log.method === "POST";
                          const isDelete = log.method === "DELETE";

                          return (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 text-slate-500">#{log.id}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                                  isGet 
                                    ? "bg-blue-950/50 text-blue-400 border border-blue-500/10" 
                                    : isPost 
                                      ? "bg-amber-950/50 text-amber-500 border border-amber-500/10"
                                      : isDelete
                                        ? "bg-rose-950/50 text-[#FF5D44] border border-red-500/10"
                                        : "bg-slate-800 text-slate-300"
                                }`}>
                                  {log.method}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-semibold">{log.path}</td>
                              <td className="py-3 px-4 text-right text-slate-500">
                                {new Date(log.createdAt).toLocaleString("ru")}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-500">
                            Серверных API запросов пока не зафиксировано или таблица логов пуста.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
