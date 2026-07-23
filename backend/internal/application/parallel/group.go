// Package parallel executa operacoes independentes com cancelamento no
// primeiro erro. Casos de uso compostos usam este helper para evitar somar a
// latencia de varias consultas remotas ao PostgreSQL.
package parallel

import (
	"context"
	"sync"
)

// Task e uma operacao que respeita o contexto recebido.
type Task func(context.Context) error

// Run executa todas as tarefas em paralelo e devolve o primeiro erro.
// Quando uma tarefa falha, as demais recebem cancelamento para que consultas
// ao banco nao continuem consumindo recursos sem necessidade.
func Run(ctx context.Context, tasks ...Task) error {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	var (
		group    sync.WaitGroup
		once     sync.Once
		firstErr error
	)

	for _, task := range tasks {
		task := task
		group.Go(func() {
			if err := task(ctx); err != nil {
				once.Do(func() {
					firstErr = err
					cancel()
				})
			}
		})
	}

	group.Wait()
	return firstErr
}
