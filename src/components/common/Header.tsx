import { useEffect, useRef, useState } from "react";
import {
  ListTodo,
  Timer,
  BarChart2,
  Moon,
  Sun,
  Gauge,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Mode } from "@/types/ui";
import { useTheme } from "@/hooks/useTheme";
import { useUi } from "@/hooks/useUi";

type NavItem = { id: Mode; label: string; icon: ReactNode };

const navItems: NavItem[] = [
  { id: "task", label: "Tasks", icon: <ListTodo size={15} /> },
  { id: "focus", label: "Focus", icon: <Timer size={15} /> },
  { id: "stats", label: "Stats", icon: <BarChart2 size={15} /> },
];

const Header = () => {
  const { mode, setMode, setIsAddingTask } = useUi();
  const { theme, setTheme } = useTheme();

  const navContainerRef = useRef<HTMLUListElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => item.id === mode);
    const activeEl = btnRefs.current[activeIndex];
    const container = navContainerRef.current;
    if (!activeEl || !container) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - containerRect.left,
      width: elRect.width,
      opacity: 1,
    });
  }, [mode]);

  const handleAddTask = () => {
    setMode("task");
    setIsAddingTask(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className="
          mx-auto flex items-center justify-between
          px-4 sm:px-6 lg:px-8 h-16
          bg-background/70 backdrop-blur-md
          border-b border-border
        "
      >
        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Gauge size={16} className="text-primary" />
          </span>
          <span className="text-lg font-light tracking-wide">
            <span className="text-primary font-semibold">G</span>auge
          </span>
        </div>

        {/* Sliding pill nav */}
        <ul
          ref={navContainerRef}
          className="relative flex items-center gap-1 p-1 rounded-xl bg-foreground/5 ring-1 ring-border"
        >
          <div
            className="absolute inset-y-1 rounded-lg bg-primary shadow-md shadow-primary/20 pointer-events-none"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              opacity: pillStyle.opacity,
              transition:
                "left 0.45s cubic-bezier(0.34,1.56,0.64,1), width 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
            }}
          />
          {navItems.map(({ id, label, icon }, index) => (
            <li key={id}>
              <button
                ref={(el) => {
                  btnRefs.current[index] = el;
                }}
                onClick={() => setMode(id)}
                className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
                  ${
                    mode === id
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Right — Add Task + Theme toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary ring-1 ring-primary/25 hover:bg-primary/20 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10 ring-1 ring-border transition-all duration-200 cursor-pointer"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
