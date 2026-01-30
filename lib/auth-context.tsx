"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  register: (name: string, email: string) => User;
}

const STORAGE_USERS_KEY = "todo-users";
const STORAGE_CURRENT_USER_KEY = "todo-current-user";

const DEFAULT_USERS: User[] = [
  { id: "user-1", name: "田中太郎", email: "tanaka@example.com" },
  { id: "user-2", name: "佐藤花子", email: "sato@example.com" },
  { id: "user-3", name: "山田次郎", email: "yamada@example.com" },
];

function loadUsers(): User[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  if (stored) {
    return JSON.parse(stored) as User[];
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

function loadCurrentUser(users: User[]): User | null {
  if (typeof window === "undefined") return null;
  const userId = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
  if (!userId) return null;
  return users.find((u) => u.id === userId) ?? null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsers = loadUsers();
    setUsers(storedUsers);
    setCurrentUser(loadCurrentUser(storedUsers));
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      setCurrentUser(user);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, userId);
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }, []);

  const register = useCallback((name: string, email: string): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
    };
    setUsers((prev) => {
      const updated = [...prev, newUser];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      return updated;
    });
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, newUser.id);
    return newUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{ users, currentUser, isLoading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
