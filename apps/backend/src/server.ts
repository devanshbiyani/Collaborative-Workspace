import "dotenv/config";

import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { z } from "zod";

import { applyOperation, getDocument } from "./collaboration-engine.js";
import { TextOperation } from "./types.js";

const PORT = Number(process.env.PORT ?? 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const REDIS_URL = process.env.REDIS_URL;

const allowedOrigins = FRONTEND_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin: string | undefined) => {
  if (!origin) return true;
  if (allowedOrigins.includes("*")) return true;
  return allowedOrigins.includes(origin);
};

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "collaboration-backend" });
});

app.get("/documents/:id", (req, res) => {
  const doc = getDocument(req.params.id);
  res.json(doc);
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
});

const opSchema = z.object({
  docId: z.string().min(1),
  position: z.number().int().nonnegative(),
  deleteCount: z.number().int().nonnegative(),
  insertText: z.string(),
  clientId: z.string().min(1),
  baseVersion: z.number().int().nonnegative(),
});

let redisPublisher: Redis | null = null;
let redisSubscriber: Redis | null = null;

if (REDIS_URL) {
  redisPublisher = new Redis(REDIS_URL);
  redisSubscriber = new Redis(REDIS_URL);

  redisSubscriber.subscribe("workspace:ops", (error: Error | null | undefined) => {
    if (error) {
      console.error("Redis subscribe error", error);
    } else {
      console.log("Subscribed to workspace:ops");
    }
  });

  redisSubscriber.on("message", (_channel: string, payload: string) => {
    const parsed = JSON.parse(payload) as TextOperation;
    const { snapshot } = applyOperation(parsed);
    io.to(parsed.docId).emit("document:updated", snapshot);
  });
}

io.on("connection", (socket) => {
  socket.on("document:join", (docId: string) => {
    socket.join(docId);
    socket.emit("document:updated", getDocument(docId));
  });

  socket.on("document:op", async (candidate: unknown) => {
    const parsed = opSchema.safeParse(candidate);

    if (!parsed.success) {
      socket.emit("document:error", {
        message: "Invalid operation payload",
        details: parsed.error.flatten(),
      });
      return;
    }

    const op = parsed.data;

    if (redisPublisher) {
      await redisPublisher.publish("workspace:ops", JSON.stringify(op));
      return;
    }

    const { snapshot, conflict } = applyOperation(op);
    io.to(op.docId).emit("document:updated", snapshot);

    if (conflict) {
      socket.emit("document:conflict", {
        message: "Version mismatch detected. Snapshot resynced.",
        snapshot,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
