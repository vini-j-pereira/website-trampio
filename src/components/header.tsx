"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Search, User, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { categoriesData } from "../components/data/categories";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const activeCategory = categoriesData.find(c => c.slug === openCategory);

  const handleOpen = (slug: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpenCategory(slug);
  };
  const handleClose = () => {
    closeTimeout.current = setTimeout(() => setOpenCategory(null), 120);
  };

  // Links mobile
  const homeLinks = [
    { label: "Login", href: "/login" },
    { label: "Cadastro", href: "/register" },
    { label: "Buscar Serviços", href: "/search" },
  ];

  const dashboardLinks = [
    { label: "Perfil", href: "/profile" },
    { label: "Chat", href: "/chat" },
    { label: "Agenda", href: "/agenda" },
    { label: "Orçamentos", href: "/quotes" },
    { label: "Configurações", href: "/settings" },
  ];

  const mobileLinks = isHome ? homeLinks : dashboardLinks;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl overflow-visible",
        scrolled && "shadow-sm"
      )}
    >
      {/* TOP BAR */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/">
          <Image src="/images/LogoPreta.png" alt="Logo" width={110} height={30} priority />
        </Link>

        {/* SEARCH */}
        {isHome && (
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-6 items-center gap-3 rounded-full border border-border bg-background px-4 py-2"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar profissionais..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-1.5 text-sm text-white hover:bg-primary/90 transition"
            >
              Buscar
            </button>
          </form>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {isHome ? (
              <Link href="/login" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-sm">Login</span>
              </Link>
            ) : null}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button className="md:hidden" onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {navOpen && (
        <div className="md:hidden bg-white border-t border-border flex flex-col gap-2 p-4">
          {mobileLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition text-sm text-muted-foreground"
              onClick={() => setNavOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* CATEGORIES (APENAS NA HOME) */}
      {isHome && (
        <>
          <div className="border-t border-border bg-background">
            <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
              {categoriesData.map((cat) => (
                <div
                  key={cat.slug}
                  onMouseEnter={() => handleOpen(cat.slug)}
                  onMouseLeave={handleClose}
                  className="relative"
                >
                  <button className="whitespace-nowrap rounded-full px-3 py-2 text-sm bg-muted text-muted-foreground hover:text-foreground hover:bg-primary/10 transition">
                    {cat.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {activeCategory && activeCategory.groups.length > 0 && (
            <div
              onMouseEnter={() => handleOpen(activeCategory.slug)}
              onMouseLeave={handleClose}
              className="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-[min(900px,95vw)] rounded-2xl border border-border bg-background p-6 shadow-2xl z-50"
            >
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {activeCategory.groups.map((group) => (
                  <div key={group.title}>
                    <h4 className="mb-2 text-sm font-semibold">{group.title}</h4>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item}>
                          <Link
                            href={`/search?category=${activeCategory.slug}&service=${encodeURIComponent(item)}`}
                            className="text-sm text-muted-foreground hover:text-primary transition"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </header>
  );
}
