// backend/src/server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js"; // <- use the app we configured

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
