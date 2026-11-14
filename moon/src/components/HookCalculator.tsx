"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Operator = "+" | "-" | "*" | "/";

type CalculatorContextValue = {
  display: string;
  error: string | null;
  input: (value: string) => void;
  clear: () => void;
  calculate: () => void;
};

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [display, setDisplay] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const clear = () => {
    setDisplay("0");
    setError(null);
  };

  const input = (value: string) => {
    setError(null);
    setDisplay((current) => {
      if (value === "." && current.includes(".")) return current;
      if (/^[+\-*/]$/.test(value)) {
        if (/^[+\-*/]$/.test(current.slice(-1))) return current.slice(0, -1) + value;
        return current + value;
      }
      if (current === "0" && value !== ".") return value;
      return current + value;
    });
  };

  const calculate = () => {
    try {
      const expression = display.replace(/×/g, "*").replace(/÷/g, "/");
      if (!/^[0-9+\-*/. ]+$/.test(expression) || /[+\-*/.]$/.test(expression)) {
        throw new Error("Enter a complete expression");
      }
      const result = Function(`"use strict"; return (${expression})`)();
      if (!Number.isFinite(result)) throw new Error("Cannot divide by zero");
      setDisplay(String(result));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid calculation");
    }
  };

  const value = useMemo(() => ({ display, error, input, clear, calculate }), [display, error]);

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
}

function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) throw new Error("HookCalculator must be rendered inside CalculatorProvider");
  return context;
}

const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];

export function HookCalculator() {
  const { display, error, input, clear, calculate } = useCalculator();

  return (
    <section aria-label="Calculator" className="w-full max-w-sm rounded-2xl border-slate-700 bg-slate-900 p-5 text-white shadow-2xl">
      <div className="mb-5 rounded-xl bg-slate-950 p-4 text-right">
        <div aria-live="polite" className="min-h-12 break-words text-4xl font-semibold tracking-tight">
          {display}
        </div>
        <div aria-live="assertive" className="mt-2 min-h-5 text-sm text-rose-300">
          {error}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <button type="button" onClick={clear} className="col-span-4 rounded-xl bg-rose-600 py-3 text-lg font-semibold hover:bg-rose-500" aria-label="Clear calculator">Clear</button>
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => (key === "=" ? calculate() : input(key))}
            className={`rounded-xl py-4 text-xl font-semibold transition-colors ${key === "=" ? "bg-emerald-600 hover:bg-emerald-500" : /^[+\-*/]$/.test(key) ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-800 hover:bg-slate-700"}`}
            aria-label={key === "=" ? "Calculate" : key}
          >
            {key === "*" ? "×" : key === "/" ? "÷" : key}
          </button>
        ))}
      </div>
    </section>
  );
}
