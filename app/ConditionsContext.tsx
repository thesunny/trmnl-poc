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
