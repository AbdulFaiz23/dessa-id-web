import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Dessa.id — Platform Promosi Lahan Pedesaan Berbasis Geospasial",
  description:
    "Temukan dan iklankan lahan pedesaan secara transparan, aman, dan berbasis data geospasial. Hubungkan pemilik lahan desa dengan investor perkotaan.",
  keywords: [
    "lahan",
    "tanah",
    "desa",
    "investasi",
    "jual beli tanah",
    "geospasial",
    "pedesaan",
  ],
  openGraph: {
    title: "Dessa.id — Platform Promosi Lahan Pedesaan",
    description:
      "Platform geospasial pertama yang menghubungkan pemilik lahan desa langsung dengan investor perkotaan.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <head>
        <link
          rel="icon"
          href="/favicon.ico"
          sizes="any"
        />
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
