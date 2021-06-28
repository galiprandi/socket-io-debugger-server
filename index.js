const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http,
  {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

const port = 10000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // On connection
  console.log(`[${socket.id}] 🔵 Client connected. (${io.engine.clientsCount})`)
  io.to(socket.id).emit('welcome', { message: `You are connect to server.` })
  // io.to(socket.id).emit('socket-new-incoming-notification', { id: Date.now(), priority: 'normal', type: 'alert', message: 'Notificación automática' })


  // On event received
  socket.on('broadcast', msg => {
    io.local.emit('from-broadcast', msg)
  })

  socket.onAny((eventName, payload) => {
    console.log(`[${socket.id}] ⚪ Event "${eventName}" payload: ${payload}`)
    io.local.emit(eventName, payload)
  })

  // On client disconnect
  socket.on('disconnect', () =>
    console.log(`[${socket.id}] 🔴 Client disconnected. (${io.engine.clientsCount})`)
  )
});




http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
