"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Dropdown,
  Footer,
  Grid,
  Input,
  Loading,
  Navbar,
  StatCard,
  Table,
  Toast,
} from "@/components/core";
import type { BuilderBlock } from "@/lib/builder";

/**
 * Blokni haqiqiy komponentga aylantiradi.
 *
 * Bu — builder'ning "qora quti"si: AI yoki foydalanuvchi xar qanday props bersa,
 * komponent har doim xavfsiz render bo'ladi (null/undefined tekshirilgan).
 */

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const num = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map((v) => String(v))
    : str(value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

export function BlockRenderer({ block }: { block: BuilderBlock }) {
  const p = block.props ?? {};

  switch (block.component) {
    case "Navbar":
      return (
        <Navbar
          title={str(p.title, "AppNest")}
          links={list(p.links)}
          action={str(p.action, "")}
        />
      );

    case "Hero":
      return (
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 px-8 py-14 text-white dark:border-slate-800">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(0,87,255,0.35),transparent)]"
          />
          <div className="relative">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight">
              {str(p.title, "Sarlavha")}
            </h2>
            <p className="mt-3 max-w-lg text-slate-300">
              {str(p.subtitle, "Izoh matni")}
            </p>
            <div className="mt-6">
              <Button>{str(p.cta, "Boshish")}</Button>
            </div>
          </div>
        </section>
      );

    case "Card":
      return (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {str(p.title, "Karta sarlavhasi")}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {str(p.body, "Karta matni")}
          </p>
        </Card>
      );

    case "Grid": {
      const cols = num(p.cols, 3);
      return (
        <Grid cols={cols === 1 || cols === 2 || cols === 4 ? cols : 3}>
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <h4 className="font-medium text-slate-900 dark:text-white">
                {str(p[`title${i + 1}`], `Element ${i + 1}`)}
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                {str(p[`body${i + 1}`], "Kontent")}
              </p>
            </Card>
          ))}
        </Grid>
      );
    }

    case "Container":
      return (
        <Container>
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
            Container — ichiga blok qo&apos;ying
          </div>
        </Container>
      );

    case "StatCard":
      return (
        <StatCard
          title={str(p.title, "Ko'rsatkich")}
          value={str(p.value, "0")}
        />
      );

    case "Table": {
      const headers = list(p.headers);
      return (
        <Table
          headers={headers.length ? headers : ["ID", "Nomi", "Holat"]}
          data={[]}
          emptyMessage="Ma'lumot kelganda ko'rsatiladi"
        />
      );
    }

    case "Button":
      return (
        <Button
          variant={
            (["primary", "secondary", "danger", "outline", "ghost"] as const).includes(
              p.variant as never
            )
              ? (p.variant as never)
              : "primary"
          }
        >
          {str(p.label, "Tugma")}
        </Button>
      );

    case "Input":
      return (
        <Input
          label={str(p.label, "Maydon")}
          placeholder={str(p.placeholder, "Qiymat kiriting")}
        />
      );

    case "Badge":
      return (
        <Badge
          color={
            (["blue", "green", "gray", "red", "yellow", "purple"] as const).includes(
              p.color as never
            )
              ? (p.color as never)
              : "blue"
          }
        >
          {str(p.label, "Nishon")}
        </Badge>
      );

    case "Dropdown":
      return (
        <Dropdown
          label={str(p.label, "Tanlov")}
          items={list(p.items).map((item) => ({ label: item, onClick: () => {} }))}
        />
      );

    case "Alert":
      return (
        <Alert
          type={
            (["info", "success", "error", "warning"] as const).includes(p.type as never)
              ? (p.type as never)
              : "info"
          }
          title={str(p.title, "Eslatma")}
        >
          {str(p.body, "Bu yerda matn ko'rsatiladi.")}
        </Alert>
      );

    case "Toast":
      return (
        <div className="pointer-events-none">
          <Toast
            message={str(p.message, "Muvaffaqiyatli")}
            type={
              (["success", "error", "info"] as const).includes(p.type as never)
                ? (p.type as never)
                : "success"
            }
          />
        </div>
      );

    case "Loading":
      return <Loading label={str(p.label, "Yuklanmoqda...")} />;

    case "Footer":
      return <Footer text={str(p.text, "© 2026")} />;

    default:
      return (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          Noma&apos;lum blok: <b>{block.component}</b>
        </div>
      );
  }
}
