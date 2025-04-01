"use client";
import type React from "react";
import { BookOpen, Router } from "lucide-react";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useRef, useState } from "react";
import { Player } from "@lordicon/react";
const ICON = require("./assets/wired-flat-245-edit-document-in-reveal.json");
import { AuthContext, AuthProvider } from "./contexts/AuthContext";
import { useRouter } from "next/navigation";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playerRef = useRef<Player>(null);
  
  useEffect(() => {
    playerRef.current?.playFromBeginning();
  }, []);
  
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separated into a child component to ensure it has access to the initialized context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const playerRef = useRef<Player>(null);
  const router =useRouter();
  // Check localStorage on mount to synchronize the login state
  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    const accessToken = localStorage.getItem("accessToken");
    
    if ((storedLoginState === "true" || storedLoginState === true) && accessToken) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);
  
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        alert("No active session found.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.status === 205) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        alert("Logged out successfully!");
        router.push("/");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to log out.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Player ref={playerRef} icon={ICON} />
                <span className="text-xl font-bold">Notecraft</span>
              </Link>
            </div>
            <nav className="flex gap-6"></nav>
            {!isLoggedIn && (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Log in
                </Link>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 bg-muted/40">{children}</main>
        <footer className="border-t bg-muted">
          <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-bold">Notecraft</span>
            </div>
            <nav className="flex gap-4 sm:gap-6">
              <Link
                href="#"
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                Contact
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Notecraft. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}