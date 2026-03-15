# Spec: Editor com Syntax Highlight

## Contexto

O editor atual (`CodeInput`) usa dois modos: **display** (renderiza `CodeBlock` via shiki no servidor) e **edit** (textarea simples sem highlight). O objetivo desta feature é tornar o editor totalmente interativo no cliente — com syntax highlight em tempo real enquanto o usuário digita/cola código — e com detecção automática de linguagem.

---

## Pesquisa de abordagens

### Como o ray.so resolve

O [ray.so](https://github.com/raycast/ray-so) usa a técnica **textarea + overlay**, que é a mais comum em editores leves para web:

- Um `<textarea>` transparente captura o input do usuário (digitação, paste, seleção, caret nativo)
- Uma `<div>` sobreposta (mesmo tamanho, mesma fonte, mesma posição) renderiza o HTML highlighted via shiki
- O scroll dos dois é sincronizado
- Para **detecção automática** de linguagem, usam `highlight.js` (`hljs.highlightAuto`) apenas para identificar a linguagem — o highlight visual em si é feito pelo shiki

### Alternativas consideradas

| Opção | Peso (bundle) | SSR | Highlight | Auto-detect | Complexidade |
|---|---|---|---|---|---|
| **textarea + shiki (client)** | leve (~shiki lazy) | não precisa | excelente | via `highlight.js` | baixa |
| CodeMirror 6 | ~300KB+ | não | excelente | embutido | alta |
| Monaco Editor | ~2MB | não | excelente | embutido | alta |
| react-simple-code-editor + prism | leve | não | boa | não tem | baixa |
| textarea + shiki (client) | leve | não precisa | excelente | via `highlight.js` | baixa |

**Conclusão:** a abordagem **textarea + shiki no cliente** (mesma do ray.so) é a escolha ideal para o devroast porque:

1. **Shiki já está no projeto** (`^4.0.2`) — zero dependências novas para o highlight
2. Bundle leve — shiki é carregado lazy por linguagem (`shiki/langs/*.mjs`)
3. Highlight de altíssima qualidade (TextMate grammars, mesma engine do VS Code)
4. Não traz abstração de editor pesada (CodeMirror/Monaco seriam overkill para o caso de uso)
5. Controle total sobre o visual — importante para manter o design fiel ao Pencil

Para **auto-detect** será necessário adicionar `highlight.js` (já usado no ray.so para essa função exclusiva), ou usar a API de detecção embutida do próprio shiki via `@shikijs/langs` se disponível na v4.

> **Pergunta aberta 1:** prefere usar `highlight.js` apenas para detecção (como o ray.so faz), ou aceita uma detecção mais simples baseada em heurísticas/extensão de arquivo? highlight.js adiciona ~40KB minzipped ao bundle do cliente.

---

## Arquitetura da solução

### Componentes envolvidos

```
src/app/_components/
  code-input.tsx          ← refatorar: passa a ser o container geral
  code-editor.tsx         ← NOVO: "use client", textarea + overlay shiki
  language-selector.tsx   ← NOVO: "use client", dropdown de seleção manual
```

### `CodeEditor` — `"use client"`

Implementa a técnica textarea + overlay:

```
┌─────────────────────────────────────────┐
│  position: relative                      │
│  ┌───────────────────────────────────┐  │
│  │  <div> highlighted HTML (overlay) │  │  ← pointer-events: none, posição absoluta
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  <textarea> (transparente)        │  │  ← captura input, color: transparent
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Props:**
```ts
type CodeEditorProps = {
  value: string
  onChange: (code: string) => void
  language: BundledLanguage | null   // null = auto-detect
  className?: string
}
```

**Responsabilidades:**
- Inicializar o highlighter shiki no cliente via `createHighlighter` (lazy, uma vez)
- Re-highlight quando `value` ou `language` mudar (debounce ~150ms)
- Sincronizar scroll entre textarea e overlay
- Renderizar HTML do shiki via `dangerouslySetInnerHTML` no overlay
- Expor ref da textarea (para focus externo)

### `LanguageSelector` — `"use client"`

Dropdown simples (sem lib externa) dentro do window chrome do editor:

```
[ Auto (javascript) ▾ ]
```

**Props:**
```ts
type LanguageSelectorProps = {
  value: BundledLanguage | null     // null = auto
  detectedLanguage: BundledLanguage | null
  onChange: (lang: BundledLanguage | null) => void
}
```

**Linguagens suportadas (subconjunto inicial):**
`javascript`, `typescript`, `tsx`, `jsx`, `python`, `go`, `rust`, `java`, `kotlin`, `swift`, `sql`, `bash`, `json`, `html`, `css`, `markdown`, `plaintext`

### `CodeInput` refatorado

Passa a orquestrar estado:
- `code: string` — valor atual do editor
- `language: BundledLanguage | null` — null = auto
- `detectedLanguage: BundledLanguage | null` — resultado do auto-detect
- Renderiza: `LanguageSelector` no chrome + `CodeEditor` no body + actions bar

---

## Fluxo de auto-detect

```
usuário digita/cola código
        ↓
onChange dispara (debounce 300ms)
        ↓
detectLanguage(code) → highlight.js highlightAuto()
        ↓
setDetectedLanguage(resultado)
        ↓
CodeEditor re-highlights com nova linguagem
        ↓
LanguageSelector exibe "Auto (javascript)" etc
```

Se o usuário selecionar uma linguagem manualmente:
- `language` passa a ter valor fixo
- Auto-detect continua rodando em background mas não afeta o highlight
- Seletor mostra a linguagem selecionada sem o "(auto)"
- Um botão/ação "voltar para auto" reseta para `null`

---

## Integração com o design existente

- O `CodeBlock` (server component) **não é mais necessário** dentro do `CodeInput` — o highlight passa a ser 100% client-side
- O `CodeBlock` continua existendo para uso em outras partes (página de resultado do roast, leaderboard detail)
- A prop `bare` adicionada ao `CodeBlock` permanece útil para esses outros contextos
- O window chrome (3 dots + `LanguageSelector`) fica no topo do editor
- Line numbers são **dinâmicos** — refletem a quantidade real de linhas do código

---

## To-dos de implementação

- [ ] Instalar `highlight.js` para detecção automática de linguagem
- [ ] Criar `src/app/_components/code-editor.tsx` com lógica de textarea + overlay shiki client-side
- [ ] Criar `src/app/_components/language-selector.tsx` com dropdown de linguagens e label "Auto (lang)"
- [ ] Refatorar `src/app/_components/code-input.tsx` para orquestrar estado (code, language, detectedLanguage)
- [ ] Remover dependência do `CodeBlock` server component de dentro do `CodeInput`
- [ ] Sincronizar scroll entre textarea e overlay no `CodeEditor`
- [ ] Implementar debounce no highlight e no auto-detect
- [ ] Testar paste de código em JS, TS, Python, SQL e verificar detecção automática
- [ ] Garantir que `CodeBlock` (server) continua funcional para uso futuro (resultado do roast)

---

## Perguntas em aberto

_Todas resolvidas._

- Auto-detect: **highlight.js**
- Números de linha: **dinâmicos**
