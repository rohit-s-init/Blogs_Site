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


app.use(cors({
    origin: "http://localhost:5173",
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


