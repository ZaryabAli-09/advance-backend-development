import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import cors from "cors";

dotenv.config();
const app = express();
// .......................................
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// .......................................
app.listen(process.env.PORT || 3000, () => {
  connectDB();
  console.log(`App listening on port ${process.env.PORT}`);
});
