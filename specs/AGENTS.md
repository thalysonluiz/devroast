# AGENTS.md — specs/

Antes de implementar qualquer feature não trivial, crie um spec nesta pasta.

## Formato

**Nome do arquivo:** `kebab-case-da-feature.md`

**Estrutura obrigatória:**

```
# Spec: <Nome da Feature>

## Contexto
Por que esta feature existe e o que ela resolve.

## Análise / Pesquisa
Abordagens consideradas, trade-offs, decisões tomadas (e por quê).
Inclua tabelas de comparação quando houver múltiplas opções.

## Arquitetura da solução
Componentes/módulos envolvidos, estrutura de arquivos, interfaces/tipos públicos.
Use diagramas ASCII quando ajudar.

## To-dos de implementação
- [ ] Passo concreto 1
- [ ] Passo concreto 2
```

## Seções opcionais

- **Schema do banco** — quando houver mudanças no banco de dados
- **Perguntas em aberto** — dúvidas a resolver antes ou durante a implementação

## Regras

- Escreva o spec **antes** de tocar no código
- Seja específico: nomes de arquivos, tipos, queries, comandos reais
- Mantenha perguntas em aberto visíveis até serem resolvidas
