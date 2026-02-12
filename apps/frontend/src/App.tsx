import { useEffect } from "react";
import { io } from "socket.io-client";

import { useWorkspaceStore } from "./store";
import { TextOperation } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000";
const socket = io(BACKEND_URL, { autoConnect: true });

export default function App() {
  const {
    clientId,
    currentDocId,
    snapshot,
    isConnected,
    setConnected,
    setSnapshot,
  } = useWorkspaceStore();

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("document:updated", setSnapshot);

    socket.emit("document:join", currentDocId);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("document:updated", setSnapshot);
    };
  }, [currentDocId, setConnected, setSnapshot]);

  const onChangeContent = (nextContent: string) => {
    const op: TextOperation = {
      docId: currentDocId,
      position: 0,
      deleteCount: snapshot.content.length,
      insertText: nextContent,
      clientId,
      baseVersion: snapshot.version,
    };

    socket.emit("document:op", op);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <section className="mx-auto max-w-4xl rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Real-Time Collaborative Workspace</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isConnected ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {isConnected ? "Live" : "Disconnected"}
          </span>
        </header>

        <p className="mb-4 text-sm text-slate-400">
          Document: <span className="font-mono">{currentDocId}</span> • Version: {snapshot.version}
        </p>

        <textarea
          value={snapshot.content}
          onChange={(event) => onChangeContent(event.target.value)}
          placeholder="Start typing with multiple browser tabs open..."
          className="h-[420px] w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm outline-none ring-indigo-500 focus:ring"
        />
      </section>
    </main>
  );
}
