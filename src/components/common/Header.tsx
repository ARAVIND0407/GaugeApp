import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="bg-card border-b border-border h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Logo + Nav links */}
      <ul className="flex items-center gap-4 sm:gap-6">
        <li>
          <p className="text-xl sm:text-2xl font-light select-none">
            <span className="text-[#A7D129] font-semibold">G</span>auge
          </p>
        </li>
        <li className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
          Tasks
        </li>
        <li className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
          Focus
        </li>
      </ul>

      {/* Right: Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </nav>
  );
};

export default Header;
