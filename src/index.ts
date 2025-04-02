import express from "express";
import { createServer } from "http";
import app from "./app.js"; // imported from app.ts

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
