"use client";

import { ArrowDownLeft, ArrowUpRight, LayoutGrid, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MobileMenu } from "@/components/layout/mobile-menu";
import { primaryNavItems } from "@/components/layout/nav";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const loadForm = () => import("@/components/transactions/transaction-form-dialog");
const TransactionFormDialog = dynamic(() => loadForm().then((module) => module.TransactionFormDialog), { ssr: false });
const mobileItems = primaryNavItems.slice(0, 3);

/** Navegação persistente com criação de lançamento disponível em qualquer aba. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "income" | null>(null);
  const routeIndex = mobileItems.findIndex((item) => pathname.startsWith(item.href));

  return (
    <>
      <nav
        className="mobile-bottom-nav lg:hidden"
        aria-label="Navegação mobile"
      >
        {mobileItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              style={{ gridColumn: index < 2 ? index + 1 : 4, gridRow: 1 }}
              className="mobile-nav-item"
              aria-current={routeIndex === index ? "page" : undefined}
              data-active={routeIndex === index}
            >
              <span className="mobile-nav-icon"><Icon aria-hidden="true" /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Popover open={actionsOpen} onOpenChange={setActionsOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="mobile-nav-create" aria-label="Adicionar transação" onPointerDown={() => { void loadForm().catch(() => undefined); }} onFocus={() => { void loadForm().catch(() => undefined); }}>
              <Plus aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" sideOffset={14} className="mobile-create-options w-56 p-2" aria-label="Tipo de transação" onCloseAutoFocus={(event) => { if (transactionType) event.preventDefault(); }}>
            {([
              { type: "expense", label: "Despesa", icon: ArrowUpRight, color: "text-negative bg-negative/10" },
              { type: "income", label: "Receita", icon: ArrowDownLeft, color: "text-positive bg-positive/10" },
            ] as const).map(({ type, label, icon: Icon, color }) => (
              <button key={type} type="button" className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none" onClick={() => { setActionsOpen(false); setTransactionType(type); }}>
                <span className={`flex size-9 items-center justify-center rounded-full ${color}`}><Icon className="size-5" aria-hidden="true" /></span>
                {label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <button
          type="button"
          className="mobile-nav-item"
          style={{ gridColumn: 5, gridRow: 1 }}
          data-active={routeIndex < 0}
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
      {transactionType ? <TransactionFormDialog open defaultType={transactionType} onOpenChange={(open) => { if (!open) setTransactionType(null); }} /> : null}
    </>
  );
}
