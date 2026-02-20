import { useContext } from "react";
import { UiProviderContext, type UiContextState } from "@/contexts/UiProviderContext";

export const useUi = (): UiContextState => {
  const context = useContext(UiProviderContext);
  if (!context) throw new Error("useUi must be used within a UiProvider");
  return context;
};
