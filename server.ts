import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Real-time Office State
  const users: Record<string, any> = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-office", (userData) => {
      users[socket.id] = {
        id: socket.id,
        name: userData.name || "Anonymous",
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
        status: userData.status || "available",
        room: userData.room || "General",
        lastSeen: Date.now()
      };
      io.emit("office-update", Object.values(users));
    });

    socket.on("update-status", (status) => {
      if (users[socket.id]) {
        users[socket.id].status = status;
        io.emit("office-update", Object.values(users));
      }
    });

    socket.on("change-room", (roomName) => {
      if (users[socket.id]) {
        users[socket.id].room = roomName;
        io.emit("office-update", Object.values(users));
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      delete users[socket.id];
      io.emit("office-update", Object.values(users));
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
