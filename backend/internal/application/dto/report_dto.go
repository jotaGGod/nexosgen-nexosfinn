package dto

// ReportInput parametriza o periodo do relatorio.
type ReportInput struct {
	Period PeriodInput
	// TrendMonths e a quantidade de meses considerados nas abas de fluxo de
	// caixa e tendencias.
	TrendMonths int
}

// ReportOverviewOutput sao os quatro cards da aba "Visao Geral".
type ReportOverviewOutput struct {
	TotalIncome      MetricOutput `json:"total_income"`
	TotalExpense     MetricOutput `json:"total_expense"`
	AverageTicket    MetricOutput `json:"average_ticket"`
	TransactionCount MetricOutput `json:"transaction_count"`
}

// TrendPointOutput e um ponto da serie de tendencias.
type TrendPointOutput struct {
	Month       string  `json:"month"`
	Label       string  `json:"label"`
	Income      float64 `json:"income"`
	Expense     float64 `json:"expense"`
	Net         float64 `json:"net"`
	SavingsRate float64 `json:"savings_rate"`
}

// TransactionHighlightOutput destaca um lancamento especifico nos insights.
type TransactionHighlightOutput struct {
	Description string            `json:"description"`
	Amount      MoneyOutput       `json:"amount"`
	Date        string            `json:"date"`
	Category    CategoryRefOutput `json:"category"`
}

// TrendingCategoryOutput e o insight "categoria em alta".
type TrendingCategoryOutput struct {
	Category  CategoryRefOutput `json:"category"`
	Current   MoneyOutput       `json:"current"`
	Previous  MoneyOutput       `json:"previous"`
	Variation float64           `json:"variation"`
}

// BestDayOutput e o insight "melhor dia" do periodo.
type BestDayOutput struct {
	Date string      `json:"date"`
	Net  MoneyOutput `json:"net"`
}

// ReportInsightsOutput reune os destaques do periodo. Todos os campos sao
// opcionais: um periodo sem movimento devolve tudo nulo, e a interface exibe
// o estado vazio.
type ReportInsightsOutput struct {
	BiggestExpense   *TransactionHighlightOutput `json:"biggest_expense"`
	SmallestExpense  *TransactionHighlightOutput `json:"smallest_expense"`
	TrendingCategory *TrendingCategoryOutput     `json:"trending_category"`
	BestDay          *BestDayOutput              `json:"best_day"`
}

// ReportOutput e a resposta completa da tela de relatorios.
type ReportOutput struct {
	Period           PeriodOutput               `json:"period"`
	Overview         ReportOverviewOutput       `json:"overview"`
	Cashflow         []CashflowPointOutput      `json:"cashflow"`
	CategoryExpenses CategoryDistributionOutput `json:"category_expenses"`
	CategoryIncomes  CategoryDistributionOutput `json:"category_incomes"`
	Trends           []TrendPointOutput         `json:"trends"`
	Insights         ReportInsightsOutput       `json:"insights"`
	ComparisonPeriod PeriodOutput               `json:"comparison_period"`
}
