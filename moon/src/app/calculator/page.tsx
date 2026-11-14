import { CalculatorProvider, HookCalculator } from "@/components/HookCalculator";

export default function CalculatorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <CalculatorProvider>
        <HookCalculator />
      </CalculatorProvider>
    </main>
  );
}
