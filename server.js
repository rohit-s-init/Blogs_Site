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
  "https://blogs-site-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

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


