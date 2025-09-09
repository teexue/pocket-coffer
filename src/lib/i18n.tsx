"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Locale = "zh-CN" | "en";

type Messages = Record<string, any>;

const defaultLocale: Locale = "zh-CN";

const localeFiles: Record<Locale, () => Promise<Messages>> = {
  "zh-CN": async () => (await import("../locales/zh-CN.json")).default,
  en: async () => (await import("../locales/en.json")).default,
};

interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  t: (path: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return defaultLocale;
    const saved = window.localStorage.getItem("i18n.locale") as Locale | null;
    return saved ?? defaultLocale;
  });
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    let cancelled = false;
    localeFiles[locale]().then((m) => {
      if (!cancelled) setMessages(m);
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("i18n.locale", locale);
    }
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    async function updateWindowTitle() {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const win = getCurrentWindow();
        const title =
          (messages?.app?.windowTitle as string) ||
          (messages?.app?.name as string) ||
          "PocketCoffer";
        await win.setTitle(title);
      } catch (e) {
        // ignore when not in Tauri or API unavailable
      }
    }
    if (
      typeof window !== "undefined" &&
      messages &&
      Object.keys(messages).length > 0
    ) {
      updateWindowTitle();
    }
  }, [messages]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (path: string) => {
      const segments = path.split(".");
      let current: any = messages;
      for (const seg of segments) {
        if (current && typeof current === "object" && seg in current) {
          current = current[seg];
        } else {
          return path;
        }
      }
      return typeof current === "string" ? current : path;
    },
    [messages]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, messages, t, setLocale }),
    [locale, messages, t, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>
        {t("common.language.zh")}/{t("common.language.en")}:
      </span>
      <select
        className="border rounded px-2 py-1 bg-transparent"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        <option value="zh-CN">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
