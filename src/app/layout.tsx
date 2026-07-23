import type { Metadata } from "next";
import "./globals.css";

const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(
    deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000",
  ),
  title: "도화지 바이브 코딩",
  description: "손그림 아이디어를 동작하는 웹 페이지로 바꿔 보세요.",
  openGraph: {
    title: "도화지 바이브 코딩",
    description: "그림 한 장을, 움직이는 웹으로.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "도화지 바이브 코딩",
    description: "그림 한 장을, 움직이는 웹으로.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
