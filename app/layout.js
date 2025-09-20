"use client";
import { AuthProvider } from "@/components/context/AuthProvider";
import "./globals.css";
import { Toaster } from "sonner";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize CRON job when the app starts
    fetch('/api/cron/init', { method: 'POST' })
      .then(response => response.json())
      .then(data => console.log('CRON job status:', data))
      .catch(error => console.error('Failed to initialize CRON job:', error));
  }, []);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster/>
      </body>
    </html>
  );
}
