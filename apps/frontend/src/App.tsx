import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { useWorkspaceStore } from "./store";
import { DocumentSnapshot, TextOperation } from "./types";

type Theme = "light" | "dark";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000";
const socket = io(BACKEND_URL, { autoConnect: true });
const SIGNIFICANT_VERSION_GAP = 2;

const resolveInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem("workspace-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export default function App() {
  const {
    clientId,
    currentDocId,
    snapshot,
    isConnected,
    setConnected,
    setSnapshot,
  } = useWorkspaceStore();
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme());
  const [editorValue, setEditorValue] = useState(snapshot.content);
  const editorValueRef = useRef(snapshot.content);
  const snapshotRef = useRef(snapshot);
  const pendingLocalContentRef = useRef<string | null>(null);

  useEffect(() => {
    const handleDocumentUpdated = (incomingSnapshot: DocumentSnapshot) => {
      const previousSnapshot = snapshotRef.current;

      snapshotRef.current = incomingSnapshot;
      setSnapshot(incomingSnapshot);

      const pendingLocalContent = pendingLocalContentRef.current;
      if (!pendingLocalContent) {
        if (incomingSnapshot.content !== editorValueRef.current) {
          setEditorValue(incomingSnapshot.content);
        }
        return;
      }

      if (incomingSnapshot.content === pendingLocalContent) {
        pendingLocalContentRef.current = null;
        if (incomingSnapshot.content !== editorValueRef.current) {
          setEditorValue(incomingSnapshot.content);
        }
        return;
      }

      const versionGap = incomingSnapshot.version - previousSnapshot.version;
      if (
        versionGap >= SIGNIFICANT_VERSION_GAP &&
        incomingSnapshot.content !== editorValueRef.current
      ) {
        pendingLocalContentRef.current = null;
        setEditorValue(incomingSnapshot.content);
      }
    };

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("document:updated", handleDocumentUpdated);

    socket.emit("document:join", currentDocId);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("document:updated", handleDocumentUpdated);
    };
  }, [currentDocId, setConnected, setSnapshot]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("workspace-theme", theme);
  }, [theme]);

  useEffect(() => {
    editorValueRef.current = editorValue;
  }, [editorValue]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const onChangeContent = (nextContent: string) => {
    setEditorValue(nextContent);
    pendingLocalContentRef.current = nextContent;

    if (!isConnected) {
      return;
    }

    const latestSnapshot = snapshotRef.current;

    const op: TextOperation = {
      docId: currentDocId,
      position: 0,
      deleteCount: latestSnapshot.content.length,
      insertText: nextContent,
      clientId,
      baseVersion: latestSnapshot.version,
    };

    socket.emit("document:op", op);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <main className="min-h-screen bg-stone-100 p-6 text-stone-900 transition-colors dark:bg-stone-950 dark:text-stone-100 sm:p-10">
      <section className="mx-auto max-w-5xl rounded-2xl border border-stone-300/80 bg-white/90 p-6 shadow-xl shadow-stone-300/25 backdrop-blur dark:border-stone-700/80 dark:bg-stone-900/90 dark:shadow-stone-950/40 sm:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4 dark:border-stone-700">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Real-Time Collaborative Workspace</h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Focused writing space with synchronized editing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 dark:focus-visible:ring-stone-500"
            >
              {theme === "dark" ? "Light theme" : "Dark theme"}
            </button>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                isConnected
                  ? "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200"
                  : "bg-stone-300 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-300">
          <p>
            Document: <span className="font-mono font-medium">{currentDocId}</span>
          </p>
          <p>Version: {snapshot.version}</p>
        </div>

        <textarea
          value={editorValue}
          onChange={(event) => onChangeContent(event.target.value)}
          placeholder="Start typing with multiple browser tabs open..."
          className="h-[440px] w-full resize-none rounded-xl border border-stone-300 bg-white p-4 font-mono text-sm leading-relaxed text-stone-800 shadow-inner outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-700"
        />
      </section>
    </main>
  );
}
