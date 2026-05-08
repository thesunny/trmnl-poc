"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  override: number | null;
  setOverride: (code: number | null) => void;
};

const ConditionsContext = createContext<Ctx>({
  override: null,
  setOverride: () => {},
});

export function ConditionsProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<number | null>(null);
  return (
    <ConditionsContext.Provider value={{ override, setOverride }}>
      {children}
    </ConditionsContext.Provider>
  );
}

export function useConditions() {
  return useContext(ConditionsContext);
}

export function ResetOverrideButton() {
  const { override, setOverride } = useConditions();
  const active = override !== null;
  return (
    <button
      type="button"
      onClick={() => setOverride(null)}
      disabled={!active}
      style={{
        fontSize: 12,
        padding: "4px 10px",
        border: "1px solid #ccc",
        borderRadius: 4,
        background: active ? "#fff" : "#f5f5f5",
        color: active ? "#000" : "#999",
        cursor: active ? "pointer" : "default",
      }}
    >
      Reset
    </button>
  );
}
