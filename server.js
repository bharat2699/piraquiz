import express from "express";
import mongoose from "mongoose";
const app = express();

import { createServer } from "http";
const server = createServer(app);

import { Server } from "socket.io";
const io = new Server(server);

import 'dotenv/config'

import User from "./user/models/user.js";
import Questions from "./quiz/models/question.js";


app.use(express.json());



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