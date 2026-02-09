"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WelcomeStep } from "./steps/WelcomeStep";
import { StackStep } from "./steps/StackStep";
import { IdentityStep } from "./steps/IdentityStep";
import { SummaryStep } from "./steps/SummaryStep";
import { ProgressBar } from "./ProgressBar";

export interface OnboardingData {
  agentType: "Assistant" | "Developer" | "Creative" | "Ops" | "";
  host: string;
  modelProvider: string;
  tools: string[];
  name: string;
  handle: string;
  description: string;
  capabilities: string[];
}

const STORAGE_KEY = "foragents_onboarding_data";

const initialData: OnboardingData = {
  agentType: "",
  host: "",
  modelProvider: "",
  tools: [],
  name: "",
  handle: "",
  description: "",
  capabilities: [],
};

function loadSavedData() {
  if (typeof window === "undefined") {
    return { step: 1, data: initialData };
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        step: parsed.step || 1,
        data: parsed.data || initialData,
      };
    }
  } catch (e) {
    console.error("Failed to parse saved onboarding data:", e);
  }
  
  return { step: 1, data: initialData };
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(() => loadSavedData().step);
  const [data, setData] = useState<OnboardingData>(() => loadSavedData().data);
  const isInitialMount = useRef(true);

  // Save to localStorage whenever data or step changes (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step: currentStep, data })
      );
    }
  }, [data, currentStep]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWizard = () => {
    setData(initialData);
    setCurrentStep(1);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (typeof window === "undefined") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={currentStep} totalSteps={4} />
      
      <Card>
        <CardContent className="p-6 sm:p-8">
          {currentStep === 1 && (
            <WelcomeStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <StackStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 3 && (
            <IdentityStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 4 && (
            <SummaryStep
              data={data}
              onPrev={prevStep}
              onReset={resetWizard}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
