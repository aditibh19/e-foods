import React from "react";
import { BottomNav } from "./bottom-nav";

export function AppLayout({ children, hideNav = false }: { children: React.ReactNode, hideNav?: boolean }) {
  return (
    <div className="w-full min-h-[100dvh] bg-background flex flex-col items-center font-sans">
      <div className="w-full max-w-[430px] flex-1 bg-background relative shadow-2xl flex flex-col min-h-[100dvh] overflow-x-hidden">
        <main className={`flex-1 flex flex-col ${!hideNav ? "pb-[90px]" : ""}`}>
          {children}
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
