import "dotenv/config";
import express from "express";
import routes from "./routes/index.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(clerkMiddleware());
app.use(express.json());
app.use("/api", routes); // attach all routes

export default app;
