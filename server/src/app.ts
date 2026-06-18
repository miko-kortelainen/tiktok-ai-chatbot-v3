import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { corsOptions } from "./config/cors";
import router from "./api/router";
import { openApiDocument } from "./api/openapi";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api", router);

// serve frontend (production build)
app.use("/", express.static("./dist/client"));
app.get("/{*splat}", (_req, res) => {
  res.sendFile("index.html", { root: "./dist/client" });
});

export default app;
