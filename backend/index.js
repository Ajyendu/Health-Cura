const app = require("./src/app");
const env = require("./src/config/env");
const { connectDB } = require("./src/config/db");

connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running at http://localhost:${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect database:", error);
    process.exit(1);
  });
