import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import { useUi } from "@/hooks/useUi";
import type { Priority } from "@/types/task";

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

const TAGS = [
  "General",
  "Work",
  "Personal",
  "Learning",
  "Health",
  "Design",
  "Engineering",
  "Strategy",
];

const priorityStyles: Record<Priority, string> = {
  Low: "border-border text-muted-foreground hover:border-primary/40 data-[active=true]:border-primary/50 data-[active=true]:bg-primary/15 data-[active=true]:text-primary",
  Medium:
    "border-border text-muted-foreground hover:border-amber-500/40 data-[active=true]:border-amber-500/60 data-[active=true]:bg-amber-500/15 data-[active=true]:text-amber-400",
  High: "border-border text-muted-foreground hover:border-red-500/40 data-[active=true]:border-red-500/60 data-[active=true]:bg-red-500/15 data-[active=true]:text-red-400",
};

const TaskInput = () => {
  const { setIsAddingTask } = useUi();
  const { addTask } = useTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [tag, setTag] = useState("Work");

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const close = () => setIsAddingTask(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), description.trim(), priority, tag);
    close();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Modal */}
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">New Task</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Break your goal into a focused session
            </p>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Task Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to focus on?"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Description{" "}
              <span className="normal-case font-normal tracking-normal text-muted-foreground/50">
                (optional)
              </span>
            </label>
            <textarea
              maxLength={200}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, links, or notes..."
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none"
            />
          </div>

          {/* Priority + Tag row */}
          <div className="flex items-start gap-6">
            {/* Priority */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Priority
              </label>
              <div className="flex items-center gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    data-active={priority === p}
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${priorityStyles[p]}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag */}
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all cursor-pointer"
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-sm font-medium transition-all cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskInput;
