import { AppShell } from "@/components/layout/AppShell";
import type { Metadata } from "next";
import { Gaegu, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const gaegu = Gaegu({
  variable: "--font-gaegu",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "시공간 앨범",
  description: "사진의 시간과 공간을 한 지도에서 보는 앨범",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSans.variable} ${gaegu.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-neutral-200 font-sans text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
