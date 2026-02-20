import Header from "@/components/common/Header";
import MainBody from "@/components/common/MainBody";
import KeyboardShortcuts from "@/components/common/KeyboardShortcuts";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <MainBody />
      <KeyboardShortcuts />
    </div>
  );
};

export default MainLayout;
