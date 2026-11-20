"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Toast } from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser } from "@/context/UserContext";
import {
  PRESET_PALETTES,
  resolvePalette,
  type Palette,
} from "@/lib/palettes";

interface Appearance {
  palette: string;
  updatedAt?: string;
}

/**
 * Admin: butun AppNest platformasining dizayn va palitrasini boshqarish.
 *
 * Ikki variant:
 * 1. Tayyor palitralar (bir bosishda)
 * 2. O'zingizning hex rangingiz
 *
 * ⚠️ Foydalanuvchilarning shaxsiy ranglari ustun turadi — bu sozlama
 * faqat shaxsiy rangi tanlanmagan foydalanuvchilarga ta'sir qiladi.
 */
export default function AppearancePage() {
  const { user, loading, setGlobalPalette } = useUser();
  const [appearance, setAppearance] = useState<Appearance | null>(null);
  const [selected, setSelected] = useState("appnest");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;

    fetch("/api/admin/appearance")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        setAppearance(data.appearance);
        setSelected(data.appearance.palette);
      })
      .catch(() => {
        if (!cancelled) setError("Dizayn sozlamalarini yuklab bo'lmadi");
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const current: Palette = resolvePalette(selected);
  const isPreset = PRESET_PALETTES.some((p) => p.id === selected);

  const choose = (value: string) => {
    setSelected(value);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ palette: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Saqlashda xatolik");
        return;
      }
      setAppearance(data.appearance);
      setToast("Platforma dizayni yangilandi");
      // Bo'yalishdan oldin qo'llash uchun (foydalanuvchi shaxsiy rangi yo'q bo'lsa)
      if (typeof window !== "undefined" && !user?.accentColor) {
        window.localStorage.setItem("appnest-accent", current.primary);
      }
      // Butun UI ni darhol yangilaymiz
      setGlobalPalette(selected);
      const root = document.documentElement;
      root.style.setProperty("--brand", current.primary);
      root.style.setProperty("--brand-accent", current.accent);
    } catch {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell title="Dizayn va palitra">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Platforma dizayni
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Butun AppNest ko&apos;rinishini boshqaring. Tanlangan palitra barcha
            foydalanuvchilarga qo&apos;llanadi (shaxsiy rangi borlar bundan mustasno).
          </p>
        </div>

        {!user || user.role !== "superadmin" ? (
          <Alert type="info" title="Faqat super admin">
            Bu bo&apos;limga faqat super administrator kirishi mumkin.
          </Alert>
        ) : error ? (
          <Alert type="error" title="Xatolik">
            {error}
          </Alert>
        ) : !appearance ? (
          <Card>
            <p className="text-sm text-slate-500">Yuklanmoqda...</p>
          </Card>
        ) : (
          <>
            {/* Jonli ko'rinish */}
            <Card>
              <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                Jonli ko&apos;rinish
              </h3>
              <div
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
                style={{
                  background: current.background,
                  color: "#e8ecf6",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${current.primary}, ${current.accent})`,
                    }}
                  >
                    A
                  </div>
                  <div>
                    <p className="font-semibold">AppNest</p>
                    <p className="text-xs text-slate-400">{current.name}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                    style={{ background: current.primary }}
                  >
                    Asosiy tugma
                  </span>
                  <span
                    className="rounded-lg px-4 py-2 text-sm font-medium"
                    style={{
                      background: current.surface,
                      border: `1px solid ${current.accent}`,
                      color: current.accent,
                    }}
                  >
                    Qo&apos;shimcha
                  </span>
                </div>
                <div className="mt-5 flex gap-2">
                  {[current.primary, current.accent, current.background, current.surface].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="h-10 flex-1 rounded-lg border border-white/10"
                        style={{ background: color }}
                        title={color}
                      />
                    )
                  )}
                </div>
              </div>
            </Card>

            {/* 1-variant: tayyor palitralar */}
            <Card>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                1. Tayyor palitralar
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Bir bosishda tanlang — darhol jonli ko&apos;rinishda ko&apos;rasiz.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PRESET_PALETTES.map((palette) => {
                  const active = selected === palette.id;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => choose(palette.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-brand bg-brand/10 ring-2 ring-brand/30"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{palette.emoji}</span>
                        {active && (
                          <span className="text-xs font-bold text-brand">✓ Tanlandi</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {palette.name}
                      </p>
                      <div className="mt-3 flex gap-1.5">
                        {[palette.primary, palette.accent, palette.background].map(
                          (c, i) => (
                            <span
                              key={i}
                              className="h-6 flex-1 rounded-md border border-black/10"
                              style={{ background: c }}
                            />
                          )
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 2-variant: o'z hex'i */}
            <Card>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                2. O&apos;z rangingiz
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Tayyor palitralar sizga mos kelmasa — o&apos;zingiznikini qo&apos;ying.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="color"
                  value={current.primary}
                  onChange={(e) => choose(e.target.value)}
                  aria-label="Rang tanlash"
                  className="h-11 w-16 cursor-pointer rounded-lg border border-slate-300 bg-transparent p-1 dark:border-slate-600"
                />
                <input
                  type="text"
                  value={isPreset ? current.primary : selected}
                  onChange={(e) => choose(e.target.value)}
                  placeholder="#0057FF"
                  aria-label="Hex rang kodi"
                  className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <div
                  className="h-11 min-w-[120px] flex-1 rounded-lg border border-black/10"
                  style={{ background: current.primary }}
                />
              </div>
            </Card>

            <div className="flex items-center gap-3">
              <Button onClick={save} disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Platforma dizaynini saqlash"}
              </Button>
              <span className="text-xs text-slate-400">
                Joriy: {resolvePalette(appearance.palette).name}
                {appearance.updatedAt &&
                  ` · ${new Date(appearance.updatedAt).toLocaleString("uz-UZ")}`}
              </span>
            </div>
          </>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DashboardShell>
  );
}
