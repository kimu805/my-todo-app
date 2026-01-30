import { TodoList } from "@/components/todo-list";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <span className="font-semibold">Todo App</span>
            <ThemeSwitcher />
          </div>
        </nav>

        <div className="flex-1 w-full max-w-4xl p-5 pt-10">
          <h1 className="text-2xl font-bold text-center mb-8">Todo Board</h1>
          <TodoList />
        </div>
      </div>
    </main>
  );
}
