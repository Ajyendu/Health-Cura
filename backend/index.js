const app = require("./src/app");
const env = require("./src/config/env");
const { connectDB } = require("./src/config/db");

const listenHost =
  process.env.RENDER === "true" || env.NODE_ENV === "production"
    ? "0.0.0.0"
    : undefined;

connectDB()
  .then(() => {
    app.listen(env.PORT, listenHost, () => {
      const where = listenHost ? `0.0.0.0:${env.PORT}` : `localhost:${env.PORT}`;
      console.log(`Server running at http://${where}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect database:", error?.message || error);
    const usingDefaultMongo =
      !process.env.MONGO_URI ||
      process.env.MONGO_URI.includes("127.0.0.1") ||
      process.env.MONGO_URI.includes("localhost");
    if (usingDefaultMongo && (process.env.RENDER === "true" || env.NODE_ENV === "production")) {
      console.error(
        "Set MONGO_URI in Render (or your host) to a real MongoDB URL — e.g. Render MongoDB or MongoDB Atlas. There is no database on localhost in the cloud."
      );
    }
    process.exit(1);
  });
