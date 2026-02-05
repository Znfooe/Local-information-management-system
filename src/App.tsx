import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/components/chat-provider";
import { Sidebar } from "@/components/Sidebar";
import { TitleBar } from "@/components/TitleBar";
import ApiManager from "@/pages/ApiManager";
import PasswordManager from "@/pages/PasswordManager";
import AiAgent from "@/pages/AiAgent";
import SettingsPage from "@/pages/Settings";
import { Toaster } from "sonner";
import "@/i18n";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ChatProvider>
        <HashRouter>
          <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden border rounded-lg shadow-xl">
            <TitleBar />
            <div className="flex-1 flex overflow-hidden">
              <Sidebar />
              <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto p-6">
                  <Routes>
                    <Route path="/" element={<ApiManager />} />
                    <Route path="/password" element={<PasswordManager />} />
                    <Route path="/ai" element={<AiAgent />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
          <Toaster
            position="top-center"
            closeButton
            toastOptions={{
              classNames: {
                toast: "bg-background text-foreground border border-border shadow-lg",
                description: "text-muted-foreground",
                actionButton: "bg-primary text-primary-foreground",
                cancelButton: "bg-muted text-muted-foreground",
                success: "text-foreground",
                error: "text-destructive",
                info: "text-foreground",
                warning: "text-yellow-500",
              },
            }}
          />
        </HashRouter>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
