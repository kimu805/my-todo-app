"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { LogIn, UserPlus } from "lucide-react";

export function LoginScreen() {
  const { users, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!selectedUserId) return;
    login(selectedUserId);
  };

  const handleRegister = () => {
    if (!name.trim() || !email.trim()) return;
    register(name.trim(), email.trim());
  };

  if (mode === "register") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-xl border border-border bg-card shadow-lg p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 justify-center">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">新規登録</h2>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-name">名前</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="名前を入力"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-email">メールアドレス</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={!name.trim() || !email.trim()}
            className="w-full"
          >
            新規登録
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            既にアカウントをお持ちの方は{" "}
            <button
              type="button"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
              onClick={() => setMode("login")}
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-border bg-card shadow-lg p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 justify-center">
          <LogIn className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">ログイン</h2>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="user-select">ユーザーを選択</Label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}（{user.email}）
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleLogin}
          disabled={!selectedUserId}
          className="w-full"
        >
          ログイン
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            onClick={() => setMode("register")}
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
}
