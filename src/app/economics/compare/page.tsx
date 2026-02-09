/* eslint-disable react/no-unescaped-entities */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { costEfficiencyScore, modelEconomics, type ModelEconomics } from "@/lib/economics";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: value < 1 ? 3 : 2,
  }).format(value);

const scoreByUseCase = (model: ModelEconomics, useCase: string) => {
  const qualityWeight = useCase === "feature-build" ? 0.6 : 0.45;
  const speedWeight = useCase === "testing" ? 0.35 : 0.2;
  const efficiencyWeight = 0.2;
  const affinityWeight = 0.15;

  const affinity = model.recommendedFor.includes(useCase) ? 10 : 5;

  return (
    model.qualityRating * qualityWeight +
    model.speedRating * speedWeight +
    Math.min(costEfficiencyScore(model), 10) * efficiencyWeight +
    affinity * affinityWeight
  );
};

const useCases = [
  { id: "feature-build", label: "Feature builds" },
  { id: "bug-fix", label: "Bug fixing" },
  { id: "code-review", label: "Code review" },
  { id: "testing", label: "Testing pipelines" },
  { id: "docs", label: "Documentation" },
];

export default function EconomicsComparePage() {
  const ranked = [...modelEconomics].sort((a, b) => costEfficiencyScore(b) - costEfficiencyScore(a));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <Badge className="mb-4 bg-[#06D6A0]/15 text-[#06D6A0] border border-[#06D6A0]/30">
          Model Cost Comparison
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-3">Compare model economics side-by-side</h1>
        <p className="text-foreground/70 max-w-3xl">
          Compare price, context window, speed, and quality. Cost-efficiency score highlights how much quality you get per dollar.
        </p>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ranked.map((model, index) => {
            const score = costEfficiencyScore(model);

            return (
              <Card key={model.id} className="bg-card/40 border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-white text-xl">{model.name}</CardTitle>
                      <p className="text-sm text-foreground/70 mt-1">{model.provider}</p>
                    </div>
                    {index === 0 && <Badge className="bg-[#06D6A0]/20 text-[#06D6A0]">Best value</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Input / 1M</span>
                    <span className="text-white">{formatCurrency(model.inputPricePer1M)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Output / 1M</span>
                    <span className="text-white">{formatCurrency(model.outputPricePer1M)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Context window</span>
                    <span className="text-white">{model.contextWindow.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Speed rating</span>
                    <span className="text-white">{model.speedRating.toFixed(1)} / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Quality rating</span>
                    <span className="text-white">{model.qualityRating.toFixed(1)} / 10</span>
                  </div>
                  <div className="mt-3 rounded-md border border-[#06D6A0]/30 bg-[#06D6A0]/10 px-3 py-2 flex items-center justify-between">
                    <span className="text-foreground/80">Cost-efficiency score</span>
                    <span className="text-[#06D6A0] font-semibold">{score.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-white mb-5">Best model recommendations by use case</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {useCases.map((useCase) => {
            const best = [...modelEconomics].sort(
              (a, b) => scoreByUseCase(b, useCase.id) - scoreByUseCase(a, useCase.id)
            )[0];

            return (
              <Card key={useCase.id} className="bg-card/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{useCase.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#06D6A0] font-semibold">{best.name}</p>
                  <p className="text-sm text-foreground/70 mt-1">
                    Quality {best.qualityRating.toFixed(1)} · Speed {best.speedRating.toFixed(1)} · Efficiency {costEfficiencyScore(best).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
