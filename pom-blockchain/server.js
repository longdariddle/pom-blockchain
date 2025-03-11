const express = require("express");
const session = require("express-session");
const Blockchain = require("./models/Blockchain");
const User = require("./models/User");
const Solver = require("./models/Solver");
const routes = require("./routes/index");

const app = express();
const blockchain = new Blockchain();

// Set blockchain on app.locals for global access
app.locals.blockchain = blockchain;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.solver = req.session.solver;
    next();
});

app.use("/", routes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});