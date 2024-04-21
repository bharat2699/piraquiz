import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import 'dotenv/config'
import User from "./user/models/user.js";
import Questions from "./quiz/models/question.js";
import authRouter from './authentication/routes/auth.js';

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server);
app.use(authRouter);




mongoose.connect(process.env.DB_URL, {
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

server.listen(process.env.PORT, () => {
  console.log("Server Sprinting at PORT: " + process.env.PORT);
});