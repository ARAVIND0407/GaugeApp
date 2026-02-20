export type Mode = "task" | "focus" | "stats";

export type UiContextState = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isAddingTask: boolean;
  setIsAddingTask: (v: boolean) => void;
};
