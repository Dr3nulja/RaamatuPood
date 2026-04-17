import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CartHydration from "@/components/CartHydration";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RaamatuPood",
  description: "RaamatuPood - modern online bookstore with curated catalog and fast delivery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();
  const userEmail = session?.user?.email ?? null;
  const isAuthenticated = Boolean(session?.user?.sub);

  let isAdmin = false;
  let userPicture = session?.user?.picture ?? null;
  let userNickname = (session?.user?.nickname as string | undefined) ?? null;
  if (session?.user?.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      select: { role: true, picture: true, name: true },
    });
    isAdmin = dbUser?.role === 'ADMIN';
    userPicture = dbUser?.picture ?? userPicture;
    userNickname = dbUser?.name ?? userNickname;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <CartHydration isAuthenticated={isAuthenticated} />
        <Header
          userEmail={userEmail}
          userNickname={userNickname}
          userPicture={userPicture}
          isAdmin={isAdmin}
        />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}