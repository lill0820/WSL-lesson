"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Filter = "all" | "active" | "completed";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = "next-todo-app-items";

const initialTodos: Todo[] = [
  { id: "welcome-1", title: "今日やることを追加する", completed: false },
  { id: "welcome-2", title: "終わったらチェックする", completed: false },
  { id: "welcome-3", title: "不要なタスクを削除する", completed: true },
];

function loadTodos() {
  if (typeof window === "undefined") {
    return initialTodos;
  }

  const storedTodos = window.localStorage.getItem(STORAGE_KEY);

  if (!storedTodos) {
    return initialTodos;
  }

  try {
    return JSON.parse(storedTodos) as Todo[];
  } catch {
    return initialTodos;
  }
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTodo.trim();

    if (!title) {
      return;
    }

    setTodos((currentTodos) => [
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
      },
      ...currentTodos,
    ]);
    setNewTodo("");
    setFilter("all");
  }

  function toggleTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function deleteTodo(id: string) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
    setFilter("all");
  }

  return (
    <main className="min-h-dvh bg-[#f7f5ef] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-slate-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Daily Tasks
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-950 sm:text-5xl">
              Todo
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-48">
            <div className="border border-slate-300 bg-white px-4 py-3">
              <span className="block text-slate-500">未完了</span>
              <strong className="text-2xl">{activeCount}</strong>
            </div>
            <div className="border border-slate-300 bg-white px-4 py-3">
              <span className="block text-slate-500">完了</span>
              <strong className="text-2xl">{completedCount}</strong>
            </div>
          </div>
        </header>

        <form
          onSubmit={addTodo}
          className="grid gap-3 border border-slate-300 bg-white p-3 sm:grid-cols-[1fr_auto]"
        >
          <label className="sr-only" htmlFor="new-todo">
            新しいタスク
          </label>
          <input
            id="new-todo"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="タスクを入力"
            className="min-h-12 border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          />
          <button
            type="submit"
            className="min-h-12 bg-slate-950 px-6 font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
          >
            追加
          </button>
        </form>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 border border-slate-300 bg-white p-1 text-sm font-semibold">
            {(["all", "active", "completed"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`min-h-10 px-4 transition ${
                  filter === option
                    ? "bg-emerald-700 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option === "all"
                  ? "すべて"
                  : option === "active"
                    ? "未完了"
                    : "完了"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
            className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:border-slate-300"
          >
            完了を削除
          </button>
        </div>

        <ul className="flex flex-col gap-3">
          {visibleTodos.map((todo) => (
            <li
              key={todo.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-slate-300 bg-white p-4"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`${todo.title}を${
                  todo.completed ? "未完了" : "完了"
                }にする`}
                className="size-5 accent-emerald-700"
              />
              <span
                className={`min-w-0 text-base ${
                  todo.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-950"
                }`}
              >
                {todo.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`${todo.title}を削除`}
                className="min-h-9 border border-slate-300 px-3 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-700"
              >
                削除
              </button>
            </li>
          ))}
        </ul>

        {visibleTodos.length === 0 ? (
          <p className="border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-slate-500">
            表示するタスクはありません。
          </p>
        ) : null}
      </section>
    </main>
  );
}
