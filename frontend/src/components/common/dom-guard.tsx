"use client";

/**
 * Protege a árvore do React contra manipulação externa do DOM.
 *
 * Extensões de navegador — tradutores, gerenciadores de senha, preenchedores
 * de formulário — reescrevem nós de texto da página por conta própria. O React
 * mantém referências dos nós que criou, então quando um desses agentes move ou
 * substitui um nó, a atualização seguinte falha com:
 *
 *   Failed to execute 'insertBefore' on 'Node': The node before which the new
 *   node is to be inserted is not a child of this node.
 *
 *   Failed to execute 'removeChild' on 'Node': The node to be removed is not a
 *   child of this node.
 *
 * O erro sobe até a fronteira de erro e derruba a tela inteira, normalmente
 * logo após uma operação bem-sucedida — o momento em que a lista é
 * reconstruída com o item novo.
 *
 * A proteção substitui os dois métodos por versões tolerantes: quando o nó de
 * referência já não pertence mais ao pai esperado, a operação é degradada em
 * vez de lançar. O resultado visual pode ficar levemente fora de ordem até a
 * próxima renderização, o que é infinitamente melhor do que perder a página.
 *
 * Isto é uma defesa contra ambiente hostil, não a correção de um defeito do
 * aplicativo: sem extensões, nenhum destes caminhos é alcançado.
 */

declare global {
  interface Window {
    __finappDomGuard?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__finappDomGuard) {
  window.__finappDomGuard = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChildSafely<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      // Outro agente já removeu ou moveu o nó: o resultado pretendido pelo
      // React — o nó fora daqui — já está satisfeito.
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBeforeSafely<T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      // A referência foi levada embora; anexar ao fim preserva o conteúdo.
      return this.appendChild(newNode);
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

/**
 * Componente sem marcação: existe apenas para que o módulo acima seja
 * carregado no cliente o mais cedo possível, junto do layout raiz.
 */
export function DomGuard() {
  return null;
}
