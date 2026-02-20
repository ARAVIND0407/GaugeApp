import { ThemeProvider } from "@/contexts/ThemeContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { UiProvider } from "@/contexts/UiContext";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="gauge-theme">
      <TaskProvider>
        <UiProvider>{children}</UiProvider>
      </TaskProvider>
    </ThemeProvider>
  );
};

export default Providers;
