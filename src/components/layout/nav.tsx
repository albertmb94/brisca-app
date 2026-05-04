import Link from "next/link";
import { Trophy, History, PlusCircle, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/nueva-partida", label: "Nueva Partida", icon: PlusCircle },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/ranking", label: "Ranking", icon: Trophy },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Trophy className="h-6 w-6" />
          <span className="font-bold text-lg">BriscaApp</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end space-x-2 md:justify-start md:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                "px-3 py-2 rounded-md"
              )}
            >
              <item.icon className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
