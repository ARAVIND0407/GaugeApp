import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import { useUi } from "@/hooks/useUi";
import TaskCard from "./TaskCard";
import TaskInput from "./TaskInput";

const TaskSection = () => {
  const { tasks } = useTask();
  const { isAddingTask } = useUi();
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Today's Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeTasks.length > 0
            ? `${activeTasks.length} remaining${completedTasks.length > 0 ? ` · ${completedTasks.length} completed` : ""}`
            : completedTasks.length > 0
              ? `All ${completedTasks.length} tasks completed 🎉`
              : "No tasks yet — press N to add one"}
        </p>
      </div>

      {/* Active tasks */}
      {activeTasks.length > 0 ? (
        <div className="flex flex-col gap-2">
          {activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground/40 text-sm">
          No pending tasks
        </div>
      )}

      {/* Completed section */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowCompleted((p) => !p)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer mb-3"
          >
            <span>Completed ({completedTasks.length})</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showCompleted ? "rotate-180" : ""}`}
            />
          </button>

          {showCompleted && (
            <div className="flex flex-col gap-2">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} dimmed />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal renders from UiContext state */}
      {isAddingTask && <TaskInput />}
    </div>
  );
};

export default TaskSection;
