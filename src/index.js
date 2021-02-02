const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('../src/utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom} = require('../src/utils/user.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 4000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket)=>{

    console.log('New WebSocket connection')

    socket.on('join', (options, callback)=>{

        const {error, user} = addUser({id: socket.id, ...options})

        if(error){
            return callback(error)
        }

        // only in server side can use socket.join()
        socket.join(user.room)
        socket.emit("message",generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit("message",generateMessage('Admin', `${user.username} has joined!`))

        // Side bar
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        // เรียกฟังก์ชัน callback ของ อีเว้น join ต่อ
        callback()
    })

    socket.on("sendMessage",(txt, callback)=>{
        // Check bad-word
        const filter = new Filter()
        if(filter.isProfane(txt)){
            return callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id)
        if(user==undefined){
            return callback('User is undefined')
            
        }
        io.to(user.room).emit("message",generateMessage(user.username, txt))
        callback()
    })
    
    socket.on("sendLocation",(coords, sendLocationCallBack)=>{
        const user = getUser(socket.id)
        if(user==undefined){
            return callback('User is undefined')
        }
        io.to(user.room).emit("messageLocation",generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        sendLocationCallBack()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})


server.listen(port, ()=>{
    console.log(`Server is up on port ${port}!`)
})

