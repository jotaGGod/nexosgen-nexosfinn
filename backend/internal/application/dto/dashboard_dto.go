package dto

// MetricOutput e um card de metrica do dashboard: valor do periodo e variacao
// percentual contra o periodo anterior.
type MetricOutput struct {
	Value     float64 `json:"value"`
	Formatted string  `json:"formatted"`
	Variation float64 `json:"variation"`
}

// DashboardSummaryOutput reune os quatro cards do topo do dashboard.
type DashboardSummaryOutput struct {
	TotalBalance MetricOutput `json:"total_balance"`
	Income       MetricOutput `json:"income"`
	Expense      MetricOutput `json:"expense"`
	Savings      MetricOutput `json:"savings"`
	SavingsRate  float64      `json:"savings_rate"`
	Period       PeriodOutput `json:"period"`
}

// CashflowPointOutput e um ponto da serie de fluxo de caixa.
type CashflowPointOutput struct {
	Month   string  `json:"month"` // AAAA-MM
	Label   string  `json:"label"` // Jan, Fev, ...
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
	Net     float64 `json:"net"`
}

// CategorySliceOutput e uma fatia do grafico de rosca por categoria.
type CategorySliceOutput struct {
	CategoryID string      `json:"category_id"`
	Name       string      `json:"name"`
	Color      string      `json:"color"`
	Icon       string      `json:"icon"`
	Total      MoneyOutput `json:"total"`
	Percentage float64     `json:"percentage"`
	Count      int         `json:"count"`
}

// CategoryDistributionOutput e o grafico de gastos por categoria.
type CategoryDistributionOutput struct {
	Total  MoneyOutput           `json:"total"`
	Slices []CategorySliceOutput `json:"slices"`
}

// GoalSummaryOutput e a meta reduzida exibida no card do dashboard.
type GoalSummaryOutput struct {
	ID            string      `json:"id"`
	Name          string      `json:"name"`
	CurrentAmount MoneyOutput `json:"current_amount"`
	TargetAmount  MoneyOutput `json:"target_amount"`
	Percentage    float64     `json:"percentage"`
	Color         string      `json:"color"`
}

// DashboardOutput e a resposta unica que alimenta a tela inicial: evita que a
// interface dispare cinco requisicoes para montar uma so pagina.
type DashboardOutput struct {
	Summary            DashboardSummaryOutput     `json:"summary"`
	Cashflow           []CashflowPointOutput      `json:"cashflow"`
	CategoryExpenses   CategoryDistributionOutput `json:"category_expenses"`
	RecentTransactions []TransactionOutput        `json:"recent_transactions"`
	Goals              []GoalSummaryOutput        `json:"goals"`
}

// DashboardInput parametriza o periodo e a janela do grafico de fluxo de caixa.
type DashboardInput struct {
	Period PeriodInput
	// CashflowMonths e a quantidade de meses exibidos no grafico de linha.
	CashflowMonths int
	// RecentLimit e a quantidade de lancamentos recentes retornados.
	RecentLimit int
}
