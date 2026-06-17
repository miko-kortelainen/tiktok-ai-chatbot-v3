import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import router from "./api/router";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", router);

// serve frontend (production build)
app.use("/", express.static("./dist/client"));
app.get("/{*splat}", (_req, res) => {
  res.sendFile("index.html", { root: "./dist/client" });
});

export default app;
