const pino = require("pino")
const log = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
})

const app = require("express")()
const http = require("http").Server(app)
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

const port = 10000

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"))

io.on("connection", (socket) => {
  // On connection send welcome message
  log.info(`[${socket.id}] 🟢 Client connected. (${io.engine.clientsCount})`)
  io.to(socket.id).emit("welcome", { message: `You are connect to server.` })

  // When an event is received, it is sent to the broadcast
  socket.on("broadcast", (msg) => io.local.emit("from-broadcast", msg))

  // Log any event received or send
  socket.onAny((eventName, payload) => {
    log.info({ eventName, payload }, "🔶 Event")
    io.local.emit(eventName, payload)
  })

  // On client disconnect
  socket.on("disconnect", () =>
    log.error(
      `[${socket.id}] 🔴 Client disconnected. (${io.engine.clientsCount})`
    )
  )
})

http.listen(port, () => {
  log.warn(`🚀 Server running on http://localhost:${port}/`)
})
