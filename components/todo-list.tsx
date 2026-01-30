"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, GripVertical } from "lucide-react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

function TaskCard({
  task,
  onToggle,
  onDelete,
  onDragStart,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      <span
        className={`flex-1 text-sm leading-relaxed ${
          task.completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {task.text}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onToggle}
        >
          {task.completed ? "戻す" : "完了"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Column({
  title,
  count,
  accentColor,
  tasks,
  onToggle,
  onDelete,
  onDragStart,
  onDrop,
}: {
  title: string;
  count: number;
  accentColor: string;
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setDragOver(false);
    onDrop(e);
  };

  return (
    <div
      className={`flex flex-col rounded-xl border bg-muted/30 transition-colors ${
        dragOver ? "border-primary/50 bg-muted/60" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className={`h-2.5 w-2.5 rounded-full ${accentColor}`} />
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3 min-h-[120px]">
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground/60 text-xs py-8">
            タスクがありません
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => onToggle(task.id)}
              onDelete={() => onDelete(task.id)}
              onDragStart={(e) => onDragStart(e, task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function TodoList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const nextIdRef = useRef(0);
  const storageKey = `todo-tasks-${userId}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Task[];
      setTasks(parsed);
      const maxId = parsed.reduce((max, t) => Math.max(max, t.id), -1);
      nextIdRef.current = maxId + 1;
    } else {
      setTasks([]);
      nextIdRef.current = 0;
    }
  }, [storageKey]);

  const persistTasks = useCallback(
    (updater: (prev: Task[]) => Task[]) => {
      setTasks((prev) => {
        const next = updater(prev);
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );

  const addTask = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    persistTasks((prev) => [
      ...prev,
      { id: nextIdRef.current++, text: trimmed, completed: false },
    ]);
    setInputValue("");
  };

  const toggleTask = (id: number) => {
    persistTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: number) => {
    persistTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", String(id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropToColumn = (completed: boolean) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    persistTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed } : task)),
    );
  };

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex gap-2 max-w-lg mx-auto w-full">
        <Input
          type="text"
          placeholder="新しいタスクを入力..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={addTask} disabled={!inputValue.trim()}>
          追加
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Column
          title="未完了"
          count={pending.length}
          accentColor="bg-blue-500"
          tasks={pending}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onDragStart={handleDragStart}
          onDrop={handleDropToColumn(false)}
        />
        <Column
          title="完了済み"
          count={done.length}
          accentColor="bg-green-500"
          tasks={done}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onDragStart={handleDragStart}
          onDrop={handleDropToColumn(true)}
        />
      </div>
    </div>
  );
}
