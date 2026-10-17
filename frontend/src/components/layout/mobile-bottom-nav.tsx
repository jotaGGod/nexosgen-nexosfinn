"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";

import { MobileMenu } from "@/components/layout/mobile-menu";
import { primaryNavItems } from "@/components/layout/nav";

/** Pílula flutuante: o círculo ativo acompanha a rota sem medir o layout. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const routeIndex = primaryNavItems.findIndex((item) => pathname.startsWith(item.href));
  const activeIndex = menuOpen || routeIndex < 0 ? primaryNavItems.length : routeIndex;

  return (
    <>
      <nav
        className="mobile-bottom-nav lg:hidden"
        aria-label="Navegação mobile"
        style={{ "--mobile-nav-index": activeIndex } as CSSProperties}
      >
        <span className="mobile-nav-indicator" aria-hidden="true" />
        {primaryNavItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="mobile-nav-item"
              aria-current={routeIndex === index ? "page" : undefined}
              data-active={activeIndex === index}
            >
              <span className="mobile-nav-icon"><Icon aria-hidden="true" /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className="mobile-nav-item"
          data-active={activeIndex === primaryNavItems.length}
          aria-label="Mais opções"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span className="mobile-nav-icon"><LayoutGrid aria-hidden="true" /></span>
          <span>Mais</span>
        </button>
      </nav>
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
