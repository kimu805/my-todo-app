"use client";

import { TodoList } from "@/components/todo-list";
import { LoginScreen } from "@/components/login-screen";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Home() {
  const { currentUser, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col items-center">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
              <span className="font-semibold">Todo App</span>
              <ThemeSwitcher />
            </div>
          </nav>
          <div className="flex-1 flex items-center p-5">
            <LoginScreen />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <span className="font-semibold">Todo App</span>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                ようこそ、{currentUser.name}さん
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                ログアウト
              </Button>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <div className="flex-1 w-full max-w-4xl p-5 pt-10">
          <h1 className="text-2xl font-bold text-center mb-8">Todo Board</h1>
          <TodoList userId={currentUser.id} />
        </div>
      </div>
    </main>
  );
}
