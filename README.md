# 🧩 valentinsGame-memoria-

Um jogo da memória robusto, responsivo e interativo desenvolvido com tecnologias web fundamentais. Este projeto foi concebido seguindo boas práticas de engenharia de software, com separação clara de responsabilidades e foco na experiência do usuário (UX).



## 🎯 Sobre o Projeto
O **valentinsGame** é mais do que um simples jogo; é um estudo de manipulação de DOM, lógica de estados em JavaScript e animações CSS3 avançadas. O objetivo é encontrar todos os pares de cartas no menor tempo ou número de tentativas possível.

---

## 🛠️ Tecnologias Utilizadas
* **HTML5:** Estrutura semântica para acessibilidade.
* **CSS3:** Layouts com **Grid** e **Flexbox**, além de animações 3D com `backface-visibility`.
* **JavaScript (ES6+):** Lógica de jogo, manipulação de eventos e algoritmo de embaralhamento.

---

## 📋 Requisitos do Sistema

### Requisitos Funcionais (RF)
- [x] **Tabuleiro Dinâmico:** Geração automática de cartas (ex: grade 4x4).
- [x] **Embaralhamento:** Implementação do algoritmo *Fisher-Yates* para aleatoriedade real.
- [x] **Mecânica de Clique:** Revelação de conteúdo ao interagir com a carta.
- [x] **Lógica de Pareamento:** Verificação inteligente de igualdade entre cartas viradas.
- [x] **Controle de Estado:** Bloqueio de cliques múltiplos durante animações de erro.
- [x] **Condição de Vitória:** Notificação de conclusão ao finalizar o tabuleiro.
- [x] **Reinicialização:** Botão de reset sem necessidade de recarregar a página.

### Requisitos Não Funcionais (RNF)
- **Responsividade:** Design adaptável para Mobile, Tablet e Desktop.
- **Performance:** Transições fluidas utilizando transformações de hardware.
- **Arquitetura:** Separação rigorosa entre HTML, CSS e JS.

---

## ⚙️ Lógica de Destaque
Para garantir que o jogo nunca apresente o mesmo padrão, utilizamos o algoritmo de **Fisher-Yates**:

```javascript
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}