import React from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, showBack, backTo = "..", rightAction, transparent }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-40 w-full px-4 h-14 flex items-center justify-between ${transparent ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b border-border/50"}`}>
      <div className="flex items-center gap-3 w-1/3">
        {showBack && (
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-card/50 hover:bg-card" asChild>
            <Link href={backTo}>
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
        )}
      </div>
      <div className="w-1/3 text-center">
        {title && <h1 className="font-semibold text-lg line-clamp-1">{title}</h1>}
      </div>
      <div className="w-1/3 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}
