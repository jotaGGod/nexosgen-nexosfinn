package handler

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/account"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/budget"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/category"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/dashboard"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/goal"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/transaction"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

// ExternalHandler atende as rotas /api/v1/external, autenticadas por API Key.
//
// Estes endpoints foram desenhados para consumo por automacoes — o caso
// previsto e um workflow n8n que recebe mensagens de texto e audio no
// WhatsApp, interpreta a intencao do usuario e chama esta API para lancar,
// alterar ou consultar transacoes.
//
// A transcricao de audio e o entendimento de linguagem natural acontecem no
// n8n e estao fora do escopo deste projeto: o que a API oferece e a superficie
// estavel que esse workflow vai consumir, ja com autenticacao por chave,
// escopos e respostas prontas para leitura em uma conversa de chat.
//
// Os casos de uso sao exatamente os mesmos da interface web. Nao existe regra
// paralela para integracao: o que muda e apenas a forma de autenticar.
type ExternalHandler struct {
	createTransaction *transaction.CreateUseCase
	updateTransaction *transaction.UpdateUseCase
	listTransactions  *transaction.ListUseCase
	listCategories    *category.ListUseCase
	listAccounts      *account.ListUseCase
	getTransaction    *transaction.GetUseCase
	listGoals         *goal.ListUseCase
	listBudgets       *budget.ListUseCase
	summary           *dashboard.GetSummaryUseCase
	logger            *slog.Logger
}

// NewExternalHandler monta o handler com seus casos de uso.
func NewExternalHandler(
	createTransaction *transaction.CreateUseCase,
	updateTransaction *transaction.UpdateUseCase,
	listTransactions *transaction.ListUseCase,
	listCategories *category.ListUseCase,
	listAccounts *account.ListUseCase,
	getTransaction *transaction.GetUseCase,
	listGoals *goal.ListUseCase,
	listBudgets *budget.ListUseCase,
	summary *dashboard.GetSummaryUseCase,
	logger *slog.Logger,
) *ExternalHandler {
	return &ExternalHandler{
		createTransaction: createTransaction,
		updateTransaction: updateTransaction,
		listTransactions:  listTransactions,
		listCategories:    listCategories,
		listAccounts:      listAccounts,
		getTransaction:    getTransaction,
		listGoals:         listGoals,
		listBudgets:       listBudgets,
		summary:           summary,
		logger:            logger,
	}
}

// GetTransaction devolve um lançamento individual sem expor o repositório.
func (h *ExternalHandler) GetTransaction(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	id, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	output, err := h.getTransaction.Execute(r.Context(), userID, id)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

func (h *ExternalHandler) GetCategory(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	id, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	items, err := h.listCategories.Execute(r.Context(), userID, "", true)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	for _, item := range items {
		if item.ID == id.String() {
			presenter.JSON(w, http.StatusOK, item)
			return
		}
	}
	presenter.Error(r.Context(), w, h.logger, domainerr.NotFound("category_not_found", "categoria nao encontrada"))
}

func (h *ExternalHandler) GetAccount(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	id, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	items, err := h.listAccounts.Execute(r.Context(), userID, true)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	for _, item := range items {
		if item.ID == id.String() {
			presenter.JSON(w, http.StatusOK, item)
			return
		}
	}
	presenter.Error(r.Context(), w, h.logger, domainerr.NotFound("account_not_found", "conta nao encontrada"))
}

func (h *ExternalHandler) GetGoal(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	id, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	items, err := h.listGoals.Execute(r.Context(), userID, "", true)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	for _, item := range items {
		if item.ID == id.String() {
			presenter.JSON(w, http.StatusOK, item)
			return
		}
	}
	presenter.Error(r.Context(), w, h.logger, domainerr.NotFound("goal_not_found", "meta não encontrada"))
}

func (h *ExternalHandler) GetBudget(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	id, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	items, err := h.listBudgets.Execute(r.Context(), userID, dto.ListBudgetsInput{Month: r.URL.Query().Get("month")})
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	for _, item := range items.Items {
		if item.ID == id.String() {
			presenter.JSON(w, http.StatusOK, item)
			return
		}
	}
	presenter.Error(r.Context(), w, h.logger, domainerr.NotFound("budget_not_found", "orçamento não encontrado"))
}

// CreateTransaction registra um lancamento vindo de uma automacao.
// Exige o escopo write:transactions.
func (h *ExternalHandler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.CreateTransactionInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.createTransaction.Execute(r.Context(), userID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusCreated, output)
}

// UpdateTransaction altera um lancamento existente.
// Exige o escopo write:transactions.
func (h *ExternalHandler) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	transactionID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.UpdateTransactionInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.updateTransaction.Execute(r.Context(), userID, transactionID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// ListTransactions consulta lancamentos com os mesmos filtros da interface web.
// Exige o escopo read:transactions.
func (h *ExternalHandler) ListTransactions(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.listTransactions.Execute(r.Context(), userID, transactionFilterFromRequest(r))
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// ListCategories devolve as categorias do usuario.
//
// E o endpoint que permite a automacao mapear um texto livre ("mercado") para
// o identificador de categoria exigido na criacao do lancamento.
// Exige o escopo read:categories.
func (h *ExternalHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.listCategories.Execute(r.Context(), userID, r.URL.Query().Get("type"), false)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.Data(w, output)
}

// ListAccounts devolve as contas do usuario, para o mesmo fim de mapeamento.
// Exige o escopo read:balance.
func (h *ExternalHandler) ListAccounts(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.listAccounts.Execute(r.Context(), userID, false)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.Data(w, output)
}

// GetBalance devolve o saldo atual e os totais do mes corrente.
//
// A resposta traz os valores ja formatados em pt-BR justamente porque o
// destino provavel e uma mensagem de texto respondida ao usuario.
// Exige o escopo read:balance.
func (h *ExternalHandler) GetBalance(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	period := vo.NewMonthPeriod(time.Now().UTC())
	if start := r.URL.Query().Get("start_date"); start != "" {
		resolved, err := dto.PeriodInput{
			StartDate: start,
			EndDate:   r.URL.Query().Get("end_date"),
		}.Resolve(time.Now().UTC())
		if err != nil {
			presenter.Error(r.Context(), w, h.logger, err)
			return
		}
		period = resolved
	}

	output, err := h.summary.Execute(r.Context(), userID, period)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}
