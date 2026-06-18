import React from "react";
import { ArrowLeft, FileText, Mail, Phone, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export type LegalPageId = "offer" | "privacy" | "contacts" | "refunds" | "service-delivery";

interface LegalPageProps {
  page: LegalPageId;
  onBackToGenerator: () => void;
}

const owner = {
  name: "Матвеев Дмитрий Дмитриевич",
  status: "самозанятый, плательщик налога на профессиональный доход",
  inn: "550367838850",
  city: "г. Омск, Центральный район",
  email: "triphoyloops@gmail.com",
  phone: "+7 908 313-62-69",
};

const updatedAt = "18 июня 2026 года";

const pageTitles: Record<LegalPageId, string> = {
  offer: "Публичная оферта",
  privacy: "Политика конфиденциальности",
  contacts: "Контакты и реквизиты",
  refunds: "Условия возврата",
  "service-delivery": "Получение цифровой услуги",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="bg-[#121214] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-3">
    <h3 className="text-sm font-bold uppercase tracking-widest text-white font-mono">{title}</h3>
    <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-sans">{children}</div>
  </section>
);

const List = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item} className="flex gap-2">
        <span className="text-emerald-400 mt-1">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const ContactsBlock = () => (
  <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
    <div className="bg-black/30 border border-white/5 rounded-xl p-3">
      <span className="block text-slate-500 uppercase mb-1">Исполнитель</span>
      <strong className="text-slate-100">{owner.name}</strong>
      <span className="block text-slate-400 mt-1">{owner.status}</span>
    </div>
    <div className="bg-black/30 border border-white/5 rounded-xl p-3">
      <span className="block text-slate-500 uppercase mb-1">ИНН</span>
      <strong className="text-slate-100">{owner.inn}</strong>
    </div>
    <div className="bg-black/30 border border-white/5 rounded-xl p-3">
      <span className="block text-slate-500 uppercase mb-1">Адрес оказания услуг</span>
      <strong className="text-slate-100">{owner.city}</strong>
    </div>
    <div className="bg-black/30 border border-white/5 rounded-xl p-3">
      <span className="block text-slate-500 uppercase mb-1">Связь</span>
      <strong className="text-slate-100">{owner.email}</strong>
      <span className="block text-slate-400 mt-1">{owner.phone}</span>
    </div>
  </div>
);

export const LegalPage: React.FC<LegalPageProps> = ({ page, onBackToGenerator }) => {
  const renderContent = () => {
    if (page === "contacts") {
      return (
        <>
          <Section title="Контакты и реквизиты">
            <ContactsBlock />
          </Section>
          <Section title="По вопросам сервиса и оплаты">
            <p>
              Напишите на email или позвоните по телефону поддержки. Обычно вопросы по доступу к тарифу,
              платежам и работе генератора решаются в течение 1-2 рабочих дней.
            </p>
          </Section>
        </>
      );
    }

    if (page === "refunds") {
      return (
        <>
          <Section title="Общие условия">
            <p>
              Decksy Ai предоставляет цифровой доступ к онлайн-сервису генерации и редактирования pitch deck
              презентаций. Тариф активируется в аккаунте пользователя после успешного подтверждения оплаты.
            </p>
          </Section>
          <Section title="Возврат оплаты">
            <p>
              Возврат оплаты не предусмотрен после активации цифрового тарифа и предоставления доступа к
              функциональности сервиса, так как услуга считается начатой и доступ предоставляется сразу.
            </p>
            <p>
              Если платеж прошел ошибочно, тариф не активировался или доступ не был предоставлен по технической
              причине, пользователь может обратиться в поддержку: {owner.email}.
            </p>
          </Section>
        </>
      );
    }

    if (page === "service-delivery") {
      return (
        <>
          <Section title="Что получает пользователь">
            <List
              items={[
                "Доступ к выбранному тарифу Decksy Ai в личном аккаунте.",
                "Месячный лимит генераций презентаций согласно выбранному тарифу.",
                "Возможность создавать, редактировать, сохранять и экспортировать pitch deck презентации.",
                "Снятие ограничений тарифа Free для платных тарифов согласно описанию на странице тарифов.",
              ]}
            />
          </Section>
          <Section title="Когда предоставляется доступ">
            <p>
              После успешной оплаты через ЮKassa сервис автоматически активирует выбранный тариф в аккаунте
              пользователя. Если статус платежа обновляется не сразу, пользователь может нажать кнопку проверки
              оплаты на странице тарифов или обратиться в поддержку.
            </p>
          </Section>
        </>
      );
    }

    if (page === "privacy") {
      return (
        <>
          <Section title="Какие данные обрабатываются">
            <List
              items={[
                "Email, имя и данные авторизации пользователя.",
                "Информация о выбранном тарифе, статусе оплаты и лимитах генераций.",
                "Тексты и параметры, которые пользователь вводит для генерации презентаций.",
                "Технические данные запросов, необходимые для безопасности и стабильности сервиса.",
              ]}
            />
          </Section>
          <Section title="Для чего используются данные">
            <p>
              Данные используются для регистрации, входа в аккаунт, подтверждения email, предоставления доступа
              к тарифам, сохранения пользовательских проектов, обработки платежей и защиты сервиса от злоупотреблений.
            </p>
          </Section>
          <Section title="Передача данных">
            <p>
              Данные могут передаваться платежному провайдеру ЮKassa, OAuth-провайдерам при входе через соцсети,
              почтовому провайдеру для отправки кодов подтверждения и AI/API-сервисам, необходимым для генерации
              презентаций. Данные не продаются третьим лицам.
            </p>
          </Section>
          <Section title="Обращения по данным">
            <p>
              Для удаления аккаунта, уточнения или исправления данных напишите на {owner.email}.
            </p>
          </Section>
        </>
      );
    }

    return (
      <>
        <Section title="Предмет оферты">
          <p>
            Исполнитель предоставляет пользователю доступ к онлайн-сервису Decksy Ai для генерации,
            редактирования, сохранения и экспорта pitch deck презентаций с использованием AI-инструментов.
          </p>
          <p>
            Оферта считается принятой пользователем при регистрации, использовании сервиса или оплате тарифа.
          </p>
        </Section>
        <Section title="Тарифы и оплата">
          <List
            items={[
              "Free: 0 ₽, базовое ознакомление с ограничениями.",
              "Базовый: 149 ₽/мес, до 5 презентаций в месяц.",
              "Миддл: 299 ₽/мес, до 15 презентаций в месяц.",
              "Проф: 499 ₽/мес, до 30 презентаций в месяц.",
            ]}
          />
          <p>
            Оплата платных тарифов выполняется через ЮKassa. Доступ к тарифу предоставляется после успешного
            подтверждения платежа.
          </p>
        </Section>
        <Section title="Порядок оказания услуги">
          <p>
            Услуга оказывается дистанционно через сайт decksy.ru. После оплаты выбранный тариф активируется
            в аккаунте пользователя, а пользователь получает возможность использовать лимиты и функции тарифа.
          </p>
        </Section>
        <Section title="Ограничения и ответственность">
          <p>
            Пользователь отвечает за корректность введенных данных и содержание создаваемых презентаций.
            Исполнитель поддерживает работоспособность сервиса и может временно ограничивать доступ для
            технического обслуживания или защиты от злоупотреблений.
          </p>
        </Section>
        <Section title="Возвраты">
          <p>
            Возврат оплаты не предусмотрен после активации цифрового тарифа и предоставления доступа к сервису.
            Если доступ не был предоставлен по технической причине, пользователь может обратиться в поддержку.
          </p>
        </Section>
        <Section title="Реквизиты исполнителя">
          <ContactsBlock />
        </Section>
      </>
    );
  };

  return (
    <motion.div
      id={`screen-legal-${page}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto relative space-y-6 pb-20 pt-4 sm:pt-8"
    >
      <button
        onClick={onBackToGenerator}
        className="inline-flex items-center space-x-2 text-xs font-mono uppercase text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-sm cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Вернуться к сервису</span>
      </button>

      <div className="bg-gradient-to-br from-emerald-950/20 to-slate-950 border border-emerald-500/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-950/30 border border-emerald-500/25 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-mono uppercase font-bold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Правовая информация Decksy Ai</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase">
          {pageTitles[page]}
        </h2>
        <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
          Актуальная редакция: {updatedAt}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            ИНН {owner.inn}
          </span>
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-400" />
            {owner.email}
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-400" />
            {owner.phone}
          </span>
        </div>
      </div>

      {renderContent()}
    </motion.div>
  );
};
