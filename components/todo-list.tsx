"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, GripVertical, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

interface Comment {
  id: number;
  text: string;
  author: { name: string };
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  comments: Comment[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTasks(data: any[]): Task[] {
  return data.map((t) => ({
    id: t.id,
    text: t.text,
    completed: t.completed,
    comments: (t.comments ?? []).map((c: any) => ({
      id: c.id,
      text: c.text,
      author: Array.isArray(c.author) ? c.author[0] : c.author,
    })),
  }));
}

function TaskCard({
  task,
  onToggle,
  onDelete,
  onAddComment,
  onDragStart,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onAddComment: (text: string) => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setCommentInput("");
  };

  const handleCommentDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div
        draggable
        onDragStart={onDragStart}
        className="flex items-center gap-2 p-3 cursor-grab active:cursor-grabbing"
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
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            {task.comments.length}
          </Button>
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

      {showComments && (
        <div
          draggable
          onDragStart={handleCommentDrag}
          className="border-t border-border px-3 pb-3 pt-2"
        >
          <div className="flex flex-col gap-1.5 mb-2">
            {task.comments.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-2 text-center">
                コメントはありません
              </p>
            ) : (
              task.comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md bg-muted/60 px-2.5 py-1.5 text-xs"
                >
                  <span className="font-medium">{c.author.name}</span>
                  <span className="text-muted-foreground ml-1.5">
                    {c.text}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-1.5">
            <Input
              type="text"
              placeholder="コメントを入力..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
              className="h-7 text-xs"
            />
            <Button
              size="sm"
              className="h-7 px-2 text-xs shrink-0"
              onClick={handleAddComment}
              disabled={!commentInput.trim()}
            >
              追加
            </Button>
          </div>
        </div>
      )}
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
  onAddComment,
  onDragStart,
  onDrop,
}: {
  title: string;
  count: number;
  accentColor: string;
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAddComment: (taskId: number, text: string) => void;
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
              onAddComment={(text) => onAddComment(task.id, text)}
              onDragStart={(e) => onDragStart(e, task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function TodoList({ userId }: { userId: string }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");

  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("id, text, completed, comments(id, text, author:profiles!author_id(name))")
      .eq("user_id", userId)
      .order("created_at");
    if (data) {
      setTasks(normalizeTasks(data));
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue("");
    await supabase.from("tasks").insert({ text: trimmed, user_id: userId });
    fetchTasks();
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", id);
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const addComment = async (taskId: number, text: string) => {
    if (!currentUser) return;
    await supabase
      .from("comments")
      .insert({ task_id: taskId, author_id: currentUser.id, text });
    fetchTasks();
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

  const handleDropToColumn =
    (completed: boolean) => async (e: React.DragEvent) => {
      e.preventDefault();
      const id = Number(e.dataTransfer.getData("text/plain"));
      await supabase.from("tasks").update({ completed }).eq("id", id);
      fetchTasks();
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
          onAddComment={addComment}
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
          onAddComment={addComment}
          onDragStart={handleDragStart}
          onDrop={handleDropToColumn(true)}
        />
      </div>
    </div>
  );
}
