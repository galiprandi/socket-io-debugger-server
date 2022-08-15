const pino = require('pino')
const log = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const port = 10000

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', socket => {
  // On connection
  log.info(`[${socket.id}] 🟢 Client connected. (${io.engine.clientsCount})`)
  io.to(socket.id).emit('welcome', { message: `You are connect to server.` })

  // On event received
  socket.on('broadcast', msg => io.local.emit('from-broadcast', msg))

  socket.onAny((eventName, payload) => {
    log.warn({ eventName, payload }, '🔶 Event')
    io.local.emit(eventName, payload)
  })

  // On client disconnect
  socket.on('disconnect', () =>
    log.error(
      `[${socket.id}] 🔴 Client disconnected. (${io.engine.clientsCount})`
    )
  )
})

http.listen(port, () => {
  log.warn(`🚀 Server running on http://localhost:${port}/`)
})
