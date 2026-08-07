// Formatação centralizada. O backend já devolve valores formatados em pt-BR
// para exibição direta; estas funções cobrem os casos em que o cliente
// precisa formatar por conta própria (eixos de gráfico, campos de formulário).

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

/** Formata um valor em reais: 1234.5 -> "R$ 1.234,50". */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Versão compacta para eixos de gráfico: 15420 -> "15,4 mil". */
export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

/** Formata uma variação percentual com sinal: 12.5 -> "+12,5%". */
export function formatVariation(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

/** Formata um percentual simples: 54.32 -> "54,3%". */
export function formatPercentage(value: number, fractionDigits = 1): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: fractionDigits })}%`;
}

/**
 * Formata uma data ISO (AAAA-MM-DD) para o padrão brasileiro.
 * A data é interpretada como UTC para que o fuso local não desloque o dia.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/** Rótulo relativo usado na lista de transações recentes. */
export function formatRelativeDate(isoDate: string): string {
  if (!isoDate) return "";

  const target = isoDate.slice(0, 10);
  const today = todayISO();

  if (target === today) return "Hoje";
  if (target === shiftDays(today, -1)) return "Ontem";
  return formatDate(target);
}

/** Data de hoje no formato AAAA-MM-DD. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Desloca uma data ISO em dias. */
export function shiftDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Primeiro dia do mês de uma data ISO. */
export function startOfMonth(isoDate: string): string {
  return `${isoDate.slice(0, 7)}-01`;
}

/** Último dia do mês de uma data ISO. */
export function endOfMonth(isoDate: string): string {
  const date = new Date(`${startOfMonth(isoDate)}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 1);
  date.setUTCDate(0);
  return date.toISOString().slice(0, 10);
}

const monthNames = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Rótulo do mês: "2024-05-01" -> "Maio de 2024". */
export function formatMonthLabel(isoDate: string): string {
  const [year, month] = isoDate.slice(0, 7).split("-");
  const name = monthNames[Number(month) - 1] ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

/** Rótulo curto de um intervalo: "01 – 31 Mai 2024". */
export function formatPeriodLabel(start: string, end: string): string {
  const short = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [startYear, startMonth, startDay] = start.slice(0, 10).split("-");
  const [endYear, endMonth, endDay] = end.slice(0, 10).split("-");

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay} – ${endDay} ${short[Number(endMonth) - 1]} ${endYear}`;
  }
  if (startYear !== endYear) {
    return `${startDay} ${short[Number(startMonth) - 1]} ${startYear} – ${endDay} ${short[Number(endMonth) - 1]} ${endYear}`;
  }
  return `${startDay} ${short[Number(startMonth) - 1]} – ${endDay} ${short[Number(endMonth) - 1]} ${endYear}`;
}

/** Iniciais para o avatar do usuário. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
