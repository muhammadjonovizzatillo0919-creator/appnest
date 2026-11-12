import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AppNest — React Admin Panel va UI Kit",
    template: "%s | AppNest",
  },
  description:
    "AppNest — Next.js va React uchun tayyor admin panel shabloni: 18 ta komponent, tungi rejim, responsive dizayn va to'liq hujjatlar.",
  keywords: [
    "AppNest",
    "React admin panel",
    "Next.js template",
    "UI kit",
    "admin dashboard",
    "Tailwind CSS",
  ],
  authors: [{ name: "AppNest" }],
  openGraph: {
    title: "AppNest — React Admin Panel va UI Kit",
    description:
      "18 ta komponent, tungi rejim va responsive dizayn — Next.js loyihalari uchun tayyor admin panel.",
    type: "website",
    siteName: "AppNest",
  },
  twitter: {
    card: "summary_large_image",
    title: "AppNest — React Admin Panel va UI Kit",
    description:
      "18 ta komponent, tungi rejim va responsive dizayn — Next.js loyihalari uchun tayyor admin panel.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

/**
 * Sahifa bo'yalishidan OLDIN tungi rejimni qo'llaydi (flash yo'q).
 * Klass `<html>` elementiga qo'yiladi, localStorage'da saqlanadi.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('appnest-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
