import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import busboy from "busboy";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import {fileURLToPath} from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import {register} from "./controllers/auth.js";
import {createPost} from "./controllers/posts.js";
import {verifyToken} from "./middleware/auth.js";


/* Configs */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));


/* File Storage */
app.post("/auth/register", (req, res, next) => {
    const bb = new busboy({headers: req.headers});

    bb.on("file", (fieldname, file, filename) => {
        file.pipe(fs.createWriteStream(`public/assets/${filename}`));
    });
    bb.on("finish", () => {
        next();
    });
    req.pipe(bb);
}, register);

app.post("/posts", verifyToken, (req, res, next) => {
    const bb = new busboy({headers: req.headers});

    bb.on("file", (fieldname, file, filename) => {
        file.pipe(fs.createWriteStream(`public/assets/${filename}`));
    });
    bb.on("finish", () => {
        next();
    });
    req.pipe(bb);
}, createPost);


/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* Mongoose Setup */
const PORT = process.env.PORT || 6001;
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGO_URL, mongooseOptions)
    .then(() => {
        app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    })
    .catch((error) => console.log(`${error} did not connect`));
