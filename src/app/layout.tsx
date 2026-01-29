import type { Metadata } from "next";
import Script from "next/script"; // Importar next/script
import { lato } from "@/config/fonts";
import "./globals.css";
import { TopMenu } from "@/components/ui/top-menu/TopMenu";
import { SideBar } from "@/components/ui/top-menu/SideBar";
import { ClientScreensaverProvider } from "@/components/screensaver/ClientScreensaverProvider";

export const metadata: Metadata = {
  title: "Collectif Engineering",
  description: "MEP Engineering Company",
  icons: {
    icon: "/favicons.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16929754367"
          strategy="afterInteractive"
          async
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16929754367');
          `}
        </Script>
      </head>
      <body className={`${lato.className}`}>
        <ClientScreensaverProvider>
          <TopMenu />
          <SideBar />
          {children}
        </ClientScreensaverProvider>
      </body>
    </html>
  );
}
