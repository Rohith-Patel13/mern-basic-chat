
const express = require("express")
const {connectToDb,getDb} = require("./db")
const {ObjectId} = require("mongodb")
const app = express()

const http = require("http"); // Imports the built-in Node.js http module, which is used to create an HTTP server.
const {Server} = require("socket.io"); // Destructures the Server class from the socket.io module. socket.io is a library for real-time web applications, and the Server class is used to create a WebSocket server.

app.use(express.json())
const cors = require('cors');
app.use(cors()); // Enable CORS for all routes
const server = http.createServer(app); // Creates an HTTP server using the Express application (app). This server will handle HTTP requests.
const {instrument}=require('@socket.io/admin-ui')

const io = new Server(server,{
    cors:{
        origin:['http://localhost:3000','https://admin.socket.io']// client running url 
    },
}); // Creates a new instance of the Server class from socket.io and attaches it to the existing HTTP server (server). It also configures CORS for WebSocket connections. In this case, it allows connections from http://localhost:3000

const userIo = io.of("/user")
userIo.on("connection",socket=>{
    console.log("connected to user namespace with username: ",socket.username)
    socket.on('disconnect', () => {
        console.log('User namespace disconnected: ',socket.id);
        // Perform cleanup tasks or any specific actions when a user disconnects
      });
})

userIo.use((socket,next)=>{
    if(socket.handshake.auth.token){
        socket.username = getUsernameFromToken(socket.handshake.auth.token)
        next()
    }
   else{
    next(new Error('Please send token'))
   }
})

function getUsernameFromToken(token){
    return token
}

io.on("connection",(socket)=>{
    console.log(`user connected: ${socket.id}`);
    socket.on("join_room",(initialJoinValue,cb)=>{
        socket.join(initialJoinValue)// id of the room you are joining
        cb(initialJoinValue)
    })

    socket.on("send_message",(data)=>{
        if(data.initialJoinValue!==""){
            socket.to(data.initialJoinValue).emit("receive_message",data.initialValue)
        }
        else{
            socket.broadcast.emit("receive_message",data.initialValue) // send message to all but not itself
        }
        
    }) // data = {initialValue,initialJoinValue

    socket.on('disconnect', () => {
        console.log('User disconnected: ',socket.id);
        // Perform cleanup tasks or any specific actions when a user disconnects
      });
    
 }) //  this code sets up an event listener for the "connection" event on the Socket.IO server. When a client connects, the callback function is executed, and it logs a message to the console indicating the successful connection along with the unique identifier (socket.id) of the connected client. This is a common pattern in Socket.IO applications to perform actions when clients connect, such as setting up event listeners for further communication.


 instrument(io,{auth:false})

// database connection 
let db
connectToDb((err)=>{
    console.log("in app.js")
    if(!err){
        server.listen(8379,()=>{
            console.log("app listening on port number 8379")
        })
        db = getDb()
    }
})


