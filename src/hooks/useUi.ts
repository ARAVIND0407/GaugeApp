import { useContext } from "react";
import { UiProviderContext } from "@/contexts/UiProviderContext";
import type { UiContextState } from "@/types/ui";

export const useUi = (): UiContextState => {
  const context = useContext(UiProviderContext);
  if (!context) throw new Error("useUi must be used within a UiProvider");
  return context;
};
