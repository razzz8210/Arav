import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { TabProvider } from "@/utils/TabContext";
import { AuthProvider } from "@/utils/AuthContext";
import { LoaderProvider } from "@/components/lottie/LoaderContext";
import { SessionWrapper } from "@/components/providers/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const mplusrounded = localFont({
  variable: "--font-mplusrounded",
  src: [
    {
      path: "../../public/fonts/mplus-rounded/MPLUSRounded1c-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
});

const opensans = localFont({
  variable: "--font-opensans",
  src: [
    {
      path: "../../public/fonts/open-sans/OpenSans-VariableFont_wdth,wght.ttf",
      weight: "300 800",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Cracked.AI",
  description: "From Prompt to Product. Fully Launched",
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Google tag (gtag.js) */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-5XWFK4RC4H"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5XWFK4RC4H');
            `}
          </Script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${mplusrounded.variable} ${opensans.variable} antialiased`}
        >
          <LoaderProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <SessionWrapper>
                <AuthProvider>
                  <TabProvider>
                    <Toaster />
                    {children}
                  </TabProvider>
                </AuthProvider>
              </SessionWrapper>
            </ThemeProvider>
          </LoaderProvider>
        </body>
      </html>
    </TRPCReactProvider>
  );
}
