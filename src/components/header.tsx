"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// ✅ IMPORTAÇÃO DO DATA
import { categoriesData } from "../components/data/categories";

export default function Header() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // ✅ melhor que state para timeout
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);

      // limpa timeout ao desmontar
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const activeCategory = categoriesData.find(
    (c) => c.slug === openCategory
  );

  const handleOpen = (slug: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpenCategory(slug);
  };

  const handleClose = () => {
    closeTimeout.current = setTimeout(() => {
      setOpenCategory(null);
    }, 120); // anti-flicker
  };

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
          <Image
            src="/images/LogoPreta.png"
            alt="Logo"
            width={110}
            height={30}
          />
        </Link>

        {/* SEARCH */}
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
            className="rounded-full bg-primary px-4 py-1.5 text-sm text-white"
          >
            Buscar
          </button>
        </form>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2"
          >
            <User className="h-5 w-5" />
            <span className="text-sm">Perfil</span>
          </Link>

          <button className="md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
          {categoriesData.map((cat) => (
            <div
              key={cat.slug}
              onMouseEnter={() => handleOpen(cat.slug)}
              onMouseLeave={handleClose}
              className="relative"
            >
              <button className="rounded-full px-3 py-2 text-sm bg-muted text-muted-foreground hover:text-foreground hover:bg-primary">
                {cat.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MEGA MENU */}
      {activeCategory && activeCategory.groups.length > 0 && (
        <div
          onMouseEnter={() => handleOpen(activeCategory.slug)}
          onMouseLeave={handleClose}
          className="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-[min(900px,95vw)] rounded-2xl border border-border bg-background p-6 shadow-2xl z-50"
        >
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {activeCategory.groups.map((group) => (
              <div key={group.title}>
                <h4 className="mb-2 text-sm font-semibold">
                  {group.title}
                </h4>

                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Link
                        href={`/search?category=${activeCategory.slug}&service=${encodeURIComponent(
                          item
                        )}`}
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
    </header>
  );
}
