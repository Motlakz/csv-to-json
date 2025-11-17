import type { Metadata } from "next";
import { Montserrat, Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ReactNode } from "react";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSV to JSON Converter | Swift Convert",
  description: "Quickly convert CSV files to JSON online. Fast, reliable, and easy-to-use CSV to JSON tool for developers, analysts, and data enthusiasts.",
  keywords: [
    "CSV to JSON",
    "CSV to JSON converter",
    "convert CSV to JSON online",
    "CSV JSON tool",
    "CSV to JSON API",
    "online CSV converter",
    "CSV to JSON conversion",
    "CSV to JSON free",
    "CSV to JSON format",
    "CSV JSON export",
    "CSV file to JSON file"
  ],
  openGraph: {
    title: "CSV to JSON Converter | Swift Convert",
    description: "Convert CSV files to JSON online quickly and effortlessly. Perfect for developers and data professionals.",
    url: "https://csvtojsonconverter.vercel.app",
    siteName: "Swift Convert",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CSV to JSON Converter"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to JSON Converter | Swift Convert",
    description: "Convert CSV files to JSON online quickly and effortlessly. Perfect for developers and data professionals.",
    images: ["/og-image.png"],
    site: "@MotlalepulaSel6"
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${quicksand.className} antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
