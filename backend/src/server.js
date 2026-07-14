require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");
const { initializeSocket } = require("./socket");

connectDB();

const server = http.createServer(app);

initializeSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `🚀 Server running on http://0.0.0.0:${PORT}`
    );

    console.log(
      `🔑 OpenRouter Key Loaded: ${
        process.env.OPENROUTER_API_KEY
          ? "YES"
          : "NO"
      }`
    );
  }
);