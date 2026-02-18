"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Wine,
    Dumbbell,
    Scissors,
    Briefcase,
    Search,
    User,
    Settings,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
    { name: "Casa", icon: Home, href: "/search?category=home", description: "Pedreiros, Jardineiros, Domésticas" },
    { name: "Eventos", icon: Wine, href: "/search?category=events", description: "Garçons, Cozinheiros" },
    { name: "Saúde", icon: Dumbbell, href: "/search?category=health", description: "Personal Trainer" },
    { name: "Estilo", icon: Scissors, href: "/search?category=style", description: "Personal Styler, Costureiras" },
    { name: "Pro", icon: Briefcase, href: "/search?category=pro", description: "Desenvolvedores, Advogados" },
];

const mainNav = [
    { name: "Explorar", icon: Search, href: "/search" },
    { name: "Perfil", icon: User, href: "/dashboard" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-20 flex-col justify-between border-r border-border bg-background transition-all duration-300 hover:w-64 group hidden md:flex">
            <div className="flex flex-col gap-6 py-6">
                <div className="flex h-12 w-full items-center justify-center group-hover:justify-start group-hover:px-6">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">T</span>
                    </div>
                    <span className="ml-3 font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Trampio
                    </span>
                </div>

                <nav className="flex flex-col gap-2 px-3">
                    <div className="text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 mb-2 uppercase tracking-wider">
                        Menu
                    </div>
                    {mainNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors relative group/item",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <nav className="flex flex-col gap-2 px-3 mt-4">
                    <div className="text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 mb-2 uppercase tracking-wider">
                        Categorias
                    </div>
                    {categories.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                                title={item.name}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                                    <span className="font-medium block">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="py-6 px-3">
                <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
                        Sair
                    </span>
                </Link>
            </div>
        </aside>
    );
}
