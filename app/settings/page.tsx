"use client";

import { useState } from "react";
import { Alert, Button, Card, Input, Toast } from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser, type SessionUser } from "@/context/UserContext";
import { PRESET_PALETTES, resolvePalette } from "@/lib/palettes";

/**
 * Profil + ish muhiti rangi.
 *
 * Rang ikki xil tanlanadi (2 variant):
 * 1. Tayyor palitralardan bir bosishda
 * 2. O'zingizning hex rangingizni kiritib
 */
function ProfileForm({ user }: { user: SessionUser }) {
  const { setUser } = useUser();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [accentColor, setAccentColor] = useState(user.accentColor);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = resolvePalette(accentColor);
  const isPreset = PRESET_PALETTES.some((p) => p.id === accentColor);

  /** Tanlangan qiymatni state va localStorage'ga yozadi (flash oldini olish) */
  const choose = (value: string) => {
    setAccentColor(value);
    setSaved(false);
    const hex = resolvePalette(value).primary;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("appnest-accent", hex);
    }
  };

  const handleSave = async () => {
    setError(undefined);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email manzili noto'g'ri");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, accentColor }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Saqlashda xatolik yuz berdi");
        return;
      }

      setUser(data.user as SessionUser);
      setSaved(true);
      setToast("Sozlamalar va rang muvaffaqiyatli saqlandi");
    } catch {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl">
        <div className="space-y-5">
          <Input
            label="Ism"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            hint="Foydalanuvchi nomi panelning yuqori qismida ko'rsatiladi"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
            }}
            error={error}
          />

          <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Ish muhiti rangi
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Panel va tugmalar siz tanlagan rangda ko&apos;rinadi.
            </p>

            {/* 1-variant: tayyor palitralar */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESET_PALETTES.map((palette) => {
                const active = accentColor === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => choose(palette.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-brand bg-brand/10 ring-2 ring-brand/30"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{palette.emoji}</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {palette.name}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <span
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{ backgroundColor: palette.accent }}
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{ backgroundColor: palette.background }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2-variant: o'zingizning hex rangingiz */}
            <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Yoki o&apos;zingizning rangingiz
              </label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="color"
                  value={current.primary}
                  onChange={(e) => choose(e.target.value)}
                  aria-label="Rang tanlash"
                  className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 bg-transparent p-0.5 dark:border-slate-600"
                />
                <input
                  type="text"
                  value={isPreset ? current.primary : accentColor}
                  onChange={(e) => choose(e.target.value)}
                  placeholder="#0057FF"
                  aria-label="Hex rang kodi"
                  className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <div
                  className="h-10 flex-1 rounded-lg border border-black/10"
                  style={{ backgroundColor: current.primary }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Hex formatida kiriting: #0057FF yoki #F5C451
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                O&apos;zgarishlar saqlandi
              </span>
            )}
          </div>
        </div>
      </Card>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

export default function SettingsPage() {
  const { user, loading } = useUser();

  return (
    <DashboardShell title="Sozlamalar">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
        Profil ma&apos;lumotlari
      </h2>

      {loading ? (
        <Card className="max-w-xl">
          <p className="text-sm text-slate-500">Yuklanmoqda...</p>
        </Card>
      ) : !user ? (
        <Alert type="info" title="Sessiya topilmadi">
          Profil ma&apos;lumotlarini ko&apos;rish uchun tizimga kiring.
        </Alert>
      ) : (
        <ProfileForm key={user.id} user={user} />
      )}
    </DashboardShell>
  );
}
