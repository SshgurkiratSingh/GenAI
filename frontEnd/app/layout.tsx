"use client";

import * as React from "react";
import "@/styles/globals.css";
import { Metadata } from "next";
import clsx from "clsx";
import { ToastContainer } from "react-toastify";

import { Providers } from "./providers";
import { SessionProvider } from "next-auth/react";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import NavigationBar from "@/components/navbar";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="white"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="black"
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SessionProvider>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <ToastContainer closeOnClick stacked theme="dark" />
            <div className="relative flex flex-col h-screen">
              <NavigationBar />
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
