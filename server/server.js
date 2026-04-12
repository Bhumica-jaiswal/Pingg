import express from 'express'
import dotenv from 'dotenv'
dotenv.config() //to load environment variables from .env file
import cors from 'cors'
import http from 'http'
import { connect } from 'http2'
import { connectDB } from './lib/db.js'
import userRoutes from './routes/userRoutes.js'
import messageRoutes from './routes/messageRoutes.js'

//create express app
const app=express()
const server=http.createServer(app) //cuz socket.io needs http server

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
