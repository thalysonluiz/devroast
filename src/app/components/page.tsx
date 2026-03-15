import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { Toggle } from "@/components/ui/toggle";

const BUTTON_VARIANTS = ["primary", "secondary", "ghost", "danger"] as const;
const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const BADGE_VARIANTS = ["critical", "warning", "good", "info"] as const;

const SAMPLE_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-bg-page text-text-primary p-12 space-y-16">
      <header>
        <h1 className="text-2xl font-mono font-semibold text-text-primary">
          <span className="text-accent-green">{"// "}</span>component_library
        </h1>
        <p className="text-text-secondary font-mono text-sm mt-1">
          Visual reference for all variants
        </p>
      </header>

      {/* Button */}
      <section className="space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
          Button
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-mono text-text-tertiary">variant</p>
            <div className="flex flex-wrap gap-3">
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant}>
                  $ {variant}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-mono text-text-tertiary">size</p>
            <div className="flex flex-wrap items-center gap-3">
              {BUTTON_SIZES.map((size) => (
                <Button key={size} size={size}>
                  $ size_{size}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-mono text-text-tertiary">disabled</p>
            <div className="flex flex-wrap gap-3">
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} disabled>
                  $ {variant}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Badge */}
      <section className="space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
          Badge
        </h2>
        <div className="flex flex-wrap gap-6">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </section>

      {/* Toggle */}
      <section className="space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
          Toggle
        </h2>
        <div className="flex flex-wrap gap-8">
          <Toggle defaultChecked label="roast mode" />
          <Toggle label="roast mode" />
        </div>
      </section>

      {/* CodeBlock */}
      <section className="space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
          CodeBlock
        </h2>
        <CodeBlock
          code={SAMPLE_CODE}
          lang="javascript"
          fileName="calculate.js"
          className="max-w-xl"
        />
      </section>

      {/* DiffLine */}
      <section className="space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
          DiffLine
        </h2>
        <div className="max-w-xl">
          <DiffLine variant="removed" code="var total = 0;" />
          <DiffLine variant="added" code="const total = 0;" />
          <DiffLine
            variant="context"
            code="for (let i = 0; i < items.length; i++) {"
          />
        </div>
      </section>

      {/* Card */}
      <section className="space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
          Card
        </h2>
        <div className="flex flex-wrap gap-6">
          <Card className="max-w-sm">
            <Card.Header>
              <Badge variant="critical">critical</Badge>
            </Card.Header>
            <Card.Title>using var instead of const/let</Card.Title>
            <Card.Description>
              the var keyword is function-scoped rather than block-scoped, which
              can lead to unexpected behavior and bugs. modern javascript uses
              const for immutable bindings and let for mutable ones.
            </Card.Description>
          </Card>
          <Card className="max-w-sm">
            <Card.Header>
              <Badge variant="warning">warning</Badge>
            </Card.Header>
            <Card.Title>missing error handling in async function</Card.Title>
            <Card.Description>
              async functions that aren&apos;t wrapped in try/catch or chained
              with .catch() will silently swallow rejections, making bugs hard
              to trace in production.
            </Card.Description>
          </Card>
          <Card className="max-w-sm">
            <Card.Header>
              <Badge variant="good">good</Badge>
            </Card.Header>
            <Card.Title>proper use of const for immutable bindings</Card.Title>
            <Card.Description>
              using const correctly signals intent and prevents accidental
              reassignment, making the code easier to reason about.
            </Card.Description>
          </Card>
        </div>
      </section>

      {/* ScoreRing */}
      <section className="space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
          ScoreRing
        </h2>
        <div className="flex flex-wrap items-center gap-12">
          <ScoreRing score={2.1} />
          <ScoreRing score={3.5} />
          <ScoreRing score={6.4} />
          <ScoreRing score={8.9} />
        </div>
      </section>
    </main>
  );
}
