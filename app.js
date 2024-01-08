const express = require("express");
const mongoose = require("mongoose");
const { PORT = 3001 } = process.env;
const app = express();

mongoose.set("strictQuery", true);
mongoose.connect(
  "mongodb://127.0.0.1:27017/wtwr_db",
  (r) => {
    console.log("connected to DB");
  },
  (e) => console.log("DB error", e),
);

const routes = require("./routes");
app.use(express.json());
app.use(routes);

app.use((req, res, next) => {
  req.user = {
    _id: "659aeb19ce904f15ce840a49",
  };
  next();
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
