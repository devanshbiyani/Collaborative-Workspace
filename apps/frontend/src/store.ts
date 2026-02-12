import { create } from "zustand";

import { DocumentSnapshot } from "./types";

type WorkspaceState = {
  clientId: string;
  currentDocId: string;
  snapshot: DocumentSnapshot;
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
  setDocId: (docId: string) => void;
  setSnapshot: (snapshot: DocumentSnapshot) => void;
};

const clientId = crypto.randomUUID();

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  clientId,
  currentDocId: "default",
  snapshot: {
    id: "default",
    content: "",
    version: 0,
    updatedAt: Date.now(),
  },
  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),
  setDocId: (currentDocId) => set({ currentDocId }),
  setSnapshot: (snapshot) => set({ snapshot }),
}));
