import { DocumentSnapshot, TextOperation } from "./types.js";

const documents = new Map<string, DocumentSnapshot>();

const defaultDoc = (id: string): DocumentSnapshot => ({
  id,
  content: "",
  version: 0,
  updatedAt: Date.now(),
});

export const getDocument = (docId: string): DocumentSnapshot => {
  const existing = documents.get(docId);
  if (existing) return existing;
  const created = defaultDoc(docId);
  documents.set(docId, created);
  return created;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const applyOperation = (
  op: TextOperation,
): { snapshot: DocumentSnapshot; conflict: boolean } => {
  const doc = getDocument(op.docId);
  const conflict = op.baseVersion !== doc.version;

  const safePos = clamp(op.position, 0, doc.content.length);
  const safeDelete = clamp(op.deleteCount, 0, doc.content.length - safePos);

  const nextContent =
    doc.content.slice(0, safePos) +
    op.insertText +
    doc.content.slice(safePos + safeDelete);

  const next: DocumentSnapshot = {
    ...doc,
    content: nextContent,
    version: doc.version + 1,
    updatedAt: Date.now(),
  };

  documents.set(op.docId, next);

  return { snapshot: next, conflict };
};
