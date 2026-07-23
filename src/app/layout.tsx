import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "도화지 바이브 코딩",
  description: "손그림 아이디어를 동작하는 웹 페이지로 바꿔 보세요.",
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
