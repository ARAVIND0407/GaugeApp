import { ThemeProvider } from "@/contexts/ThemeContext";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="gauge-theme">
      {children}
    </ThemeProvider>
  );
};

export default Providers;
