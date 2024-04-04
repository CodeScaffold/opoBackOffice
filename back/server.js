const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // No need for bodyParser in newer Express versions

// Place the login route here
app.post("/login", (req, res) => {
  // Login logic from the provided example
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
