import { useState, type ReactNode } from "react";
import { UiProviderContext } from "./UiProviderContext";
import type { Mode } from "@/types/ui";

export const UiProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>("task");
  const [isAddingTask, setIsAddingTask] = useState(false);

  return (
    <UiProviderContext.Provider
      value={{ mode, setMode, isAddingTask, setIsAddingTask }}
    >
      {children}
    </UiProviderContext.Provider>
  );
};
