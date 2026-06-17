export const allowedOrigins = ["http://localhost:5173", "http://localhost:8081", "http://localhost:3001"];

// cors options for the HTTP server
export const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

// cors options socket.io
export const socketCorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
};
