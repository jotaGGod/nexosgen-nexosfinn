import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number({ invalid_type_error: "Informe um valor" })
    .positive("O valor deve ser maior que zero"),
  description: z.string().min(1, "Informe uma descrição").max(200, "Descrição muito longa"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  account_id: z.string().min(1, "Selecione uma conta"),
  date: z.string().min(1, "Informe a data"),
  notes: z.string().max(1000, "Observação muito longa"),
  is_settled: z.boolean(),
  settled_at: z.string(),
});

export type TransactionValues = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Informe o nome").max(120, "Nome muito longo"),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor inválida"),
  icon: z.string().min(1, "Selecione um ícone"),
});

export type CategoryValues = z.infer<typeof categorySchema>;

export const accountSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(120, "Nome muito longo"),
  type: z.enum(["checking", "savings", "credit_card", "cash", "investment"]),
  initial_balance: z.number({ invalid_type_error: "Informe um valor" }),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor inválida"),
  icon: z.string().min(1, "Selecione um ícone"),
});

export type AccountValues = z.infer<typeof accountSchema>;

export const goalSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(120, "Nome muito longo"),
  target_amount: z
    .number({ invalid_type_error: "Informe um valor" })
    .positive("O valor alvo deve ser maior que zero"),
  current_amount: z
    .number({ invalid_type_error: "Informe um valor" })
    .min(0, "O valor acumulado não pode ser negativo"),
  deadline: z.string(),
  image_url: z.string().max(500).or(z.literal("")),
  icon: z.string().min(1),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor inválida"),
});

export type GoalValues = z.infer<typeof goalSchema>;

export const budgetSchema = z.object({
  category_id: z.string().min(1, "Selecione uma categoria"),
  limit_amount: z
    .number({ invalid_type_error: "Informe um valor" })
    .positive("O limite deve ser maior que zero"),
});

export type BudgetValues = z.infer<typeof budgetSchema>;
