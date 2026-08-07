// Package service reune as regras de calculo do dominio que nao pertencem a
// uma unica entidade.
//
// Tudo aqui e puro: recebe dados, devolve resultado, sem tocar em banco,
// HTTP ou relogio global (o instante atual e sempre um parametro).
package service

import (
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// TotalBalance devolve o saldo consolidado do usuario: a soma dos saldos
// iniciais das contas ativas mais o resultado liquido de todos os lancamentos
// ate a data de corte.
func TotalBalance(accounts []*entity.Account, netUntilNow vo.Money) vo.Money {
	total := netUntilNow
	for _, account := range accounts {
		if account.Archived {
			continue
		}
		total = total.Add(account.InitialBalance)
	}
	return total
}

// AccountBalance devolve o saldo de uma conta especifica a partir do seu
// saldo inicial e do liquido movimentado nela.
func AccountBalance(account *entity.Account, netMovement vo.Money) vo.Money {
	return account.InitialBalance.Add(netMovement)
}

// Savings devolve quanto sobrou no periodo (receitas menos despesas).
// Um valor negativo significa que o usuario gastou mais do que recebeu.
func Savings(income, expense vo.Money) vo.Money { return income.Sub(expense) }

// SavingsRate devolve o percentual da receita que foi poupado no periodo.
func SavingsRate(income, expense vo.Money) float64 {
	if !income.IsPositive() {
		return 0
	}
	return Savings(income, expense).PercentageOf(income)
}
