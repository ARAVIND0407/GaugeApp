import { ThemeProvider } from "@/contexts/ThemeContext";
import type { ReactNode } from "react";
import { TaskProvider } from "@/contexts/TaskContext";

type Props = {
  children: ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="gauge-theme">
      <TaskProvider>{children}</TaskProvider>
    </ThemeProvider>
  );
};

export default Providers;
