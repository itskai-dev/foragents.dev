interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, label: "Welcome" },
    { number: 2, label: "Stack" },
    { number: 3, label: "Identity" },
    { number: 4, label: "Ready" },
  ];

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center gap-2 flex-1"
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                transition-colors duration-300
                ${
                  step.number < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.number === currentStep
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "bg-secondary text-muted-foreground"
                }
              `}
            >
              {step.number}
            </div>
            <span
              className={`text-xs font-medium transition-colors duration-300 ${
                step.number <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
