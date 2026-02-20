import { createContext } from "react";
import type { UiContextState } from "@/types/ui";

export const UiProviderContext = createContext<UiContextState | null>(null);
