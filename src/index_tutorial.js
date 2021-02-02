//
//  Goal: Create an Express web server
//
//  1. Initialize npm and install Express
//  2. Setup a new Express server
//      - Serve up the public directory
//      - Listen on port 3000
//  3. Create index.html and render "Chat App" to the screen
//  4. Test your work! Start the server and view the page in the browser


//*** ลง nodemon ให้รัน npm run dev ได้ ต้องลง แบบ save-dev
//*** คือ npm i nodemon --save-dev


const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)   // here we create a server out side of express library because we need to config server with implement socket.io
const io = socketio(server)             // function socketio() need http parameter so that why we create server before

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

// Print a message to terminal when we have a client connect
// One time for each new connection

let count = 0

io.on('connection', (socket)=>{
    // console log in server terminal
    console.log('New WebSocket connection')

    // server push count updated to client
    socket.emit('countUpdated',count)   // this mean : countUpdated = count

    // ให้คนอื่น ทุก ๆ คนเห็นข้อความนี้ ยกเว้น ตัวผู้เล่นใหม่ ที่ไม่เห็น
    socket.broadcast.emit("message","A new user has joined!")

    // EX. สำหรับห้องแชทรวม
    // เราจะ comment สองอันนี้ออก เพราะว่า สองอันนี้ ใช้ สำหรับ global room
    // socket.emit("message",generateMessage('Welcome!'))
    // socket.broadcast.emit("message",generateMessage("A new user has joined!"))


    // เราสามารถรับค่า callback ฟังก์ชัน มาได้ด้วย
    socket.on("sendMessage",(txt, callback)=>{
        io.emit("message",txt)
        // หลังจาก server ส่งข้อความให้ทุกคนแล้ว
        // สามารถเรียก callback ที่ client socket นั่นที่เขียนพร้อม ส่งข้อความมาได้
        // โดยการ รับ callback ด้านบนด้วย แล้วนำมาเรียกใช้ข้างใน
        callback("The message was delivered!")
    })
    
    // ฟังก์ชัน sendLocation ในเซิฟเวอร์ รอรับ Location coords ของ แต่ละยูส
    socket.on("sendLocation",(coords)=>{
        // push Location ให้ทุกคนเห็น
        io.emit("message",`Location: ${coords.latitude},${coords.longitude}`)
    })
    
    // waiting for client call function increment request to server
    socket.on('increment',()=>{
        // do something
        count ++
        // server push count updated to client
        //socket.emit('countUpdated',count)   // but for socket.emit everyone can't see the update value, only a person that call increment function can see the message update, SO ITS NOT OUR POINT.

        // We need every can see the update value, so we change to use
        io.emit('countUpdated', count)

    })

    // disconnect ต้องอยู่ ใน io.on('connection') เท่านั้น
    socket.on('disconnect',()=>{
        io.emit('message','A user has left!')
    })
})



server.listen(port, ()=>{
    console.log(`Server is up on port ${port}!`)
})

