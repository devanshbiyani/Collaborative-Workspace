import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const sanitizeRoomId = (value: string) => value.trim();

export default function Home() {
  const navigate = useNavigate();
  const [newRoomKeyword, setNewRoomKeyword] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const generatedRoomIdHint = useMemo(() => uuidv4(), []);

  const navigateToRoom = (roomId: string) => {
    navigate(`/documents/${encodeURIComponent(roomId)}`);
  };

  const onCreateRoom = (event: FormEvent) => {
    event.preventDefault();
    const normalizedKeyword = sanitizeRoomId(newRoomKeyword);
    navigateToRoom(normalizedKeyword || uuidv4());
  };

  const onJoinRoom = (event: FormEvent) => {
    event.preventDefault();
    const normalizedRoomId = sanitizeRoomId(joinRoomId);

    if (!normalizedRoomId) {
      return;
    }

    navigateToRoom(normalizedRoomId);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-7 shadow-2xl shadow-stone-400/20 sm:p-9">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Collaborative Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">Start or join a room</h1>
          <p className="mt-3 text-sm text-stone-600">
            Create a custom room keyword for interviews, pair-programming, or quick collaboration.
          </p>
        </header>

        <div className="space-y-7">
          <form onSubmit={onCreateRoom} className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-5">
            <div>
              <h2 className="text-lg font-medium text-stone-900">Create Room</h2>
              <p className="mt-1 text-sm text-stone-600">
                Leave empty to auto-generate a UUIDv4 (example: <span className="font-mono">{generatedRoomIdHint}</span>).
              </p>
            </div>

            <input
              type="text"
              value={newRoomKeyword}
              onChange={(event) => setNewRoomKeyword(event.target.value)}
              placeholder="my-interview"
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-300"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
            >
              Create room
            </button>
          </form>

          <form onSubmit={onJoinRoom} className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-5">
            <div>
              <h2 className="text-lg font-medium text-stone-900">Join Room</h2>
              <p className="mt-1 text-sm text-stone-600">Paste a room ID or keyword to continue where your team left off.</p>
            </div>

            <input
              type="text"
              value={joinRoomId}
              onChange={(event) => setJoinRoomId(event.target.value)}
              placeholder="Room ID or keyword"
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-300"
            />

            <button
              type="submit"
              disabled={!sanitizeRoomId(joinRoomId)}
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-stone-900 ring-1 ring-stone-300 transition hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Join room
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
