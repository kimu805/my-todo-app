"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { LogIn, UserPlus } from "lucide-react";

export function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    setSubmitting(true);
    const err = await login(email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  const handleRegister = async () => {
    setError("");
    setSubmitting(true);
    const err = await register(name.trim(), email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError("");
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-password">パスワード</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={handleRegister}
            disabled={!name.trim() || !email.trim() || !password || submitting}
            className="w-full"
          >
            {submitting ? "登録中..." : "新規登録"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            既にアカウントをお持ちの方は{" "}
            <button
              type="button"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
              onClick={() => switchMode("login")}
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

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">メールアドレス</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">パスワード</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          onClick={handleLogin}
          disabled={!email.trim() || !password || submitting}
          className="w-full"
        >
          {submitting ? "ログイン中..." : "ログイン"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            onClick={() => switchMode("register")}
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
}
