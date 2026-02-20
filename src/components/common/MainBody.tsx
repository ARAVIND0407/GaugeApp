import { useUi } from "@/hooks/useUi";
import FocusSection from "@/components/focus/FocusSection";
import TaskSection from "@/components/tasks/TaskSection";
import StatsSection from "@/components/stats/StatsSection";

const MainBody = () => {
  const { mode } = useUi();

  return (
    <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
      {mode === "focus" ? (
        <FocusSection />
      ) : mode === "task" ? (
        <TaskSection />
      ) : (
        <StatsSection />
      )}
    </main>
  );
};

export default MainBody;
