require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const socketServer = require("./socket");
const port = parseInt(process.env.PORT || "8002", 10);
require("./config/mongo");
const app = express();

app.use(
  cors({
    origin: [process.env.BASE_URL],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60,
    }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method}=>${req.url}`);
  next();
});
app.get("/", (req, res) => res.json({ message: "Hello world" }));
app.use("/", require("./routes"));

const server = socketServer(app);
server.listen(port, "0.0.0.0");
console.log(`> Server listening at http://localhost:${port}`);
