import { InferSchemaType, Model, Schema, model, models } from "mongoose";

import { DocumentSnapshot, TextOperation } from "./types.js";

const documentSchema = new Schema(
  {
    _id: { type: String, required: true },
    content: { type: String, required: true, default: "" },
    version: { type: Number, required: true, default: 0 },
  },
  {
    strict: "throw",
    timestamps: false,
  },
);

type DocumentRecord = InferSchemaType<typeof documentSchema>;

type DocumentModel = Model<DocumentRecord>;

const Document = (models.Document as DocumentModel | undefined) ?? (model("Document", documentSchema) as DocumentModel);

const toSnapshot = (doc: DocumentRecord): DocumentSnapshot => ({
  id: doc._id,
  content: doc.content,
  version: doc.version,
  updatedAt: Date.now(),
});

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const getDocument = async (docId: string): Promise<DocumentSnapshot> => {
  const existing = await Document.findById(docId).lean<DocumentRecord | null>();

  if (existing) {
    return toSnapshot(existing);
  }

  const created = await Document.create({
    _id: docId,
    content: "",
    version: 0,
  });

  return toSnapshot(created.toObject<DocumentRecord>());
};

export const applyOperation = async (
  op: TextOperation,
): Promise<{ snapshot: DocumentSnapshot; conflict: boolean }> => {
  const doc = await getDocument(op.docId);
  const conflict = op.baseVersion !== doc.version;

  const safePos = clamp(op.position, 0, doc.content.length);
  const safeDelete = clamp(op.deleteCount, 0, doc.content.length - safePos);

  const nextContent =
    doc.content.slice(0, safePos) +
    op.insertText +
    doc.content.slice(safePos + safeDelete);

  const nextVersion = doc.version + 1;

  await Document.findByIdAndUpdate(
    op.docId,
    {
      content: nextContent,
      version: nextVersion,
    },
    {
      upsert: true,
      new: false,
      setDefaultsOnInsert: true,
      strict: "throw",
    },
  );

  return {
    snapshot: {
      id: op.docId,
      content: nextContent,
      version: nextVersion,
      updatedAt: Date.now(),
    },
    conflict,
  };
};
