import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "신입 온보딩 퀴즈 챌린지",
  description: "교재만 올리면 AI가 출제하고, QR로 폰에서 응시하고, 끝나자마자 채점·리포트까지",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ede4ff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gaegu:wght@700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
