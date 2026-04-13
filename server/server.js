import express from 'express'
import dotenv from 'dotenv'
dotenv.config() //to load environment variables from .env file
import cors from 'cors'
import http from 'http'
import { connect } from 'http2'
import { connectDB } from './lib/db.js'
import userRoutes from './routes/userRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import { Server } from 'socket.io'

//create express app
const app=express()
const server=http.createServer(app) //cuz socket.io needs http server
//initialise socket.io server
export const io=new Server(server,{
    cors:{
        origin:"*"   //to allow connection from frontend 
    }
})

//store online users
export const userSocketMap={} //{userId:socketId}
//scocket.io connection event
io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId //get user id from query params when client connects
    console.log("User connected:", userId)
    if(userId){
        userSocketMap[userId]=socket.id //store user id and socket id in the map when user connects
    }
    //emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap)) //send list of online users to all clients
    socket.on("disconnect",()=>{
        console.log("User disconnected:", userId)
        delete userSocketMap[userId] //remove user from map when they disconnect
        io.emit("getOnlineUsers",Object.keys(userSocketMap)) //update online users for all clients
    })
})

//Middleware setup
app.use(express.json({limit:"4mb"})) //to parse json bodies and set size limit and also send data in json responses
app.use(cors()) //to connect frontend and backend
app.use("/api/status", (req, res) => { //a simple route to check if the server is running
  res.json({ status: "Server is running" });
});
app.use("/api/auth", userRoutes) //to use the user routes for all routes starting with /api/auth
app.use("/api/messages", messageRoutes) //to use the message routes for all routes starting with /api/messages
//connect to the database
await(connectDB())
//define port and start server
const PORT=process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

