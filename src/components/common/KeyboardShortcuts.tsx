import { useEffect } from "react";
import { useUi } from "@/hooks/useUi";

const hints = [
  { key: "N", label: "New" },
  { key: "T", label: "Tasks" },
  { key: "F", label: "Focus" },
  { key: "S", label: "Stats" },
];

/**
 * Global keyboard shortcut handler + hint bar.
 * Rendered once in MainLayout — active on every page.
 */
const KeyboardShortcuts = () => {
  const { setMode, setIsAddingTask } = useUi();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      // Don't fire inside inputs / textareas
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      switch (e.key.toLowerCase()) {
        case "n":
          setIsAddingTask(true);
          break;
        case "t":
          setMode("task");
          break;
        case "f":
          setMode("focus");
          break;
        case "s":
          setMode("stats");
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setMode, setIsAddingTask]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 pointer-events-none select-none">
      {hints.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center gap-1 bg-muted/70 ring-1 ring-border rounded-md px-2 py-1.5 backdrop-blur-sm"
        >
          <span className="text-[11px] font-mono font-bold text-primary">
            {key}
          </span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default KeyboardShortcuts;
