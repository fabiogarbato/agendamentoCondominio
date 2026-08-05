import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { SideNav } from "@/components/SideNav";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/Toaster";
// CSS do react-toastify antes do globals.css: assim os overrides de
// --toastify-* em :root (globals.css) vencem os defaults da lib na cascata.
import "react-toastify/ReactToastify.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agenda de Prestadores",
  description: "Organize a agenda dos prestadores de serviço que visitam o apartamento",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground lg:flex-row">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* A partir de lg o body vira linha: SideNav (w-60) + main. A largura
              da sidebar existe em UM lugar só — nada de w-60 aqui e pl-60 lá.

              Sobre o encaixe mx-auto + w-full + flex-1 no <main> (Flexbox 8.1):
              ele fica, e não é decorativo. Até ~1400px o max-w-6xl nem chega a
              valer (em 1366 sobram 1111px ao lado da sidebar) e quem garante a
              largura é o w-full, que dá flex-basis 100% e depois encolhe pro
              espaço disponível. Acima disso o flex-grow bate no max-width e as
              margens auto centralizam a coluna no que sobra. lg:min-w-0 desliga
              o min-width:auto do flex item pra conteúdo largo não estourar.
              Não entra lg:flex-1: flex-1 já está ali sem prefixo. */}
          <SideNav />
          <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-6 lg:min-w-0 lg:max-w-6xl lg:px-8 lg:pb-10">
            {children}
          </main>
          <NavBar />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
