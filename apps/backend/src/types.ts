export type TextOperation = {
  docId: string;
  position: number;
  deleteCount: number;
  insertText: string;
  clientId: string;
  baseVersion: number;
};

export type DocumentSnapshot = {
  id: string;
  content: string;
  version: number;
  updatedAt: number;
};
