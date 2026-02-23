import Header from "@/components/common/Header";
import MainBody from "@/components/common/MainBody";
import KeyboardShortcuts from "@/components/common/KeyboardShortcuts";
import { Toaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";

const MainLayout = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <MainBody />
      <KeyboardShortcuts />
      <Toaster
        theme={theme}
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "16px",
            fontFamily: "inherit",
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
