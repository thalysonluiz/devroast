# UI Components — Padrões de criação

Este documento define os padrões obrigatórios para todos os componentes dentro de `src/components/ui/`.

---

## Regras gerais

### 1. Nunca use `default export`
Todos os componentes usam **named export**.

```tsx
// correto
export function Button({ ... }: ButtonProps) {}

// errado
export default function Button({ ... }: ButtonProps) {}
```

### 2. Estenda as props nativas do elemento HTML
Use `ComponentProps<"elemento">` do React para herdar todos os atributos nativos do HTML, garantindo que o componente aceite `onClick`, `disabled`, `aria-*`, etc.

```tsx
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & ButtonVariants;
```

### 3. Use `tailwind-variants` (`tv`) para variantes e merge de classes
Defina todas as variantes com `tv()`. Passe `className` diretamente para a chamada da função gerada — o `tailwind-variants` resolve o merge internamente. **Não use `twMerge` em conjunto com `tv()`.**

```tsx
import { tv, type VariantProps } from "tailwind-variants";

const component = tv({
  base: "...",
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ComponentVariants = VariantProps<typeof component>;
type ComponentProps = ComponentProps<"div"> & ComponentVariants;

export function Component({ variant, size, className, ...props }: ComponentProps) {
  return <div {...props} className={component({ variant, size, className })} />;
}
```

### 4. Use `twMerge` isoladamente apenas quando não houver `tv()`
Se um componente simples não precisar de variantes, pode usar `twMerge` diretamente para mesclar classes externas com as internas.

```tsx
import { twMerge } from "tailwind-merge";

export function Divider({ className, ...props }: ComponentProps<"hr">) {
  return <hr {...props} className={twMerge("border-zinc-800", className)} />;
}
```

### 5. Tipagem de variantes separada
Extraia sempre o tipo das variantes em um `type` dedicado antes de compor o `Props` final.

```tsx
type ButtonVariants = VariantProps<typeof button>;
type ButtonProps = ComponentProps<"button"> & ButtonVariants;
```

### 6. Um componente por arquivo
Cada arquivo exporta um único componente principal. O nome do arquivo deve ser o kebab-case do componente:

```
button.tsx       → export function Button
input.tsx        → export function Input
badge.tsx        → export function Badge
```

---

## Estrutura de arquivo referência

```tsx
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const component = tv({
  base: [...],
  variants: {
    variant: { ... },
    size: { ... },
  },
  defaultVariants: { ... },
});

type ComponentVariants = VariantProps<typeof component>;

type ComponentProps = ComponentProps<"elemento"> & ComponentVariants;

export function Component({ variant, size, className, ...props }: ComponentProps) {
  return <elemento {...props} className={component({ variant, size, className })} />;
}
```

---

## Stack de estilização

| Biblioteca | Uso |
|---|---|
| `tailwindcss` | Classes utilitárias base |
| `tailwind-variants` | Variantes, compound variants e merge de className |
| `tailwind-merge` | Merge pontual fora de contexto de `tv()` |
