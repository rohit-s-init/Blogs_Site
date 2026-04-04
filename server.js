import dotenv from "dotenv"
dotenv.config();
import express from "express";
import router from "./routes/index.route.js"
import path from "path"
import cookieParser from "cookie-parser";
import cors from "cors"

let app = express();
const PORT = process.env.PORT || 3000;
const __dirname = import.meta.dirname;

const allowedOrigins = [
  "http://localhost:5173",
  "https://blogs-site-frontend.vercel.app",
  "https://blogs-site-frontend-git-main-rohit-s-inits-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
// --------routes
// ---------------

app.use("/api", router)

// error 404 ---------------
// error 404 ---------------

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "router not found"
    })
})



app.listen(PORT, () => {
    console.log("server launced on localhost:3000");
})


