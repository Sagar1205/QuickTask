import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: {
    default: "QuickTask – Simple Team Task Management",
    template: "%s | QuickTask",
  },
  description:
    "QuickTask helps teams create, organize, and track tasks effortlessly. Collaborate in real time, set priorities, and get things done faster.",
  applicationName: "QuickTask",
  keywords: [
    "task management",
    "team collaboration",
    "todo app",
    "project management",
    "productivity",
    "quicktask",
  ],
  authors: [{ name: "QuickTask Team" }],
  creator: "QuickTask",
  metadataBase: new URL("https://quick-task-bice.vercel.app"),
  openGraph: {
    title: "QuickTask – Simple Team Task Management",
    description:
      "Create tasks, collaborate with your team, and stay productive with QuickTask.",
    url: "https://quick-task-bice.vercel.app",
    siteName: "QuickTask",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickTask – Simple Team Task Management",
    description:
      "Organize tasks, collaborate with your team, and get work done faster with QuickTask."
  },
  icons: {
    icon: [
      {
        url: "/task.svg",
        type: "image/svg+xml",
      },
      // {
      //   url: "/task.svg",
      //   media: "(prefers-color-scheme: light)",
      //   type: "image/svg+xml",
      // },
      // {
      //   url: "/checklist.svg",
      //   media: "(prefers-color-scheme: light)",
      //   type: "image/svg+xml",
      // },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-900 dark:bg-black/5 dark:text-white">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
