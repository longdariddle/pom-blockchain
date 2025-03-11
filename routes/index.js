const express = require("express");
const User = require("../models/User");
const Solver = require("../models/Solver");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/login", (req, res) => {
    res.render("login", { type: req.query.type || "user", error: null });
});

router.post("/login", (req, res) => {
    const { username, password, type } = req.body;
    if (type === "user") {
        const user = User.findByUsername(username);
        if (user && user.checkPassword(password)) {
            req.session.user = user;
            return res.redirect("/userDashboard");
        }
    } else {
        const solver = Solver.findByUsername(username);
        if (solver && solver.checkPassword(password)) {
            req.session.solver = solver;
            req.app.locals.blockchain.registerSolver(username);
            return res.redirect("/solverDashboard");
        }
    }
    res.render("login", { type, error: "Invalid credentials" });
});

router.get("/register", (req, res) => {
    res.render("register", { type: req.query.type || "user", error: null });
});

router.post("/register", (req, res) => {
    const { username, password, type } = req.body;
    const success = type === "user" ? User.register(username, password) : Solver.register(username, password);
    if (success) {
        return res.redirect("/login?type=" + type);
    }
    res.render("register", { type, error: "Username taken" });
});

router.get("/userDashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login?type=user");
    console.log("Pending solution:", req.app.locals.blockchain.pendingSolution);
    console.log("Winning solution:", req.app.locals.blockchain.winningSolution);
    res.render("userDashboard", { 
        problems: req.app.locals.blockchain.currentProblems,
        solution: req.app.locals.blockchain.winningSolution || req.app.locals.blockchain.pendingSolution || null,
        blockchain: req.app.locals.blockchain
    });
});

router.post("/submitProblem", (req, res) => {
    if (!req.session.user) return res.redirect("/login?type=user");
    const problem = req.app.locals.blockchain.addProblem(req.body.description, req.session.user.username);
    res.redirect("/userDashboard");
});

router.get("/solverDashboard", (req, res) => {
    if (!req.session.solver) return res.redirect("/login?type=solver");
    res.render("solverDashboard", { 
        problems: req.app.locals.blockchain.currentProblems,
        solver: req.app.locals.blockchain.solvers[req.session.solver.username],
        blockchain: req.app.locals.blockchain
    });
});

router.post("/submitSolution", (req, res) => {
    if (!req.session.solver) return res.redirect("/login?type=solver");
    const problemIds = req.app.locals.blockchain.currentProblems.map(p => p.id); // All problem IDs
    const welfareScores = problemIds.reduce((acc, id) => {
        acc[id] = parseInt(req.body[`welfare_${id}`]);
        return acc;
    }, {});
    req.app.locals.blockchain.submitSolution(req.session.solver.username, problemIds, welfareScores);
    res.redirect("/solverDashboard");
});

router.post("/finalize", (req, res) => {
    if (!req.session.solver) return res.redirect("/login?type=solver");
    const success = req.app.locals.blockchain.finalizeBlock(req.session.solver.username);
    if (success) {
        console.log("Block finalized by:", req.session.solver.username);
    }
    res.redirect("/solverDashboard");
});

router.get("/solutionResponse", (req, res) => {
    if (!req.session.user) return res.redirect("/userDashboard");
    res.render("solutionResponse", { 
        solution: req.app.locals.blockchain.winningSolution || req.app.locals.blockchain.pendingSolution || null,
        blockchain: req.app.locals.blockchain
    });
});

router.post("/submitResponse", (req, res) => {
    if (!req.session.user || (!req.app.locals.blockchain.pendingSolution && !req.app.locals.blockchain.winningSolution)) return res.redirect("/userDashboard");
    const { accept } = req.body;
    req.app.locals.blockchain.submitResponse(req.body.problemId, req.session.user.username, accept === "true");
    res.redirect("/userDashboard");
});

router.get("/blockchainHistory", (req, res) => {
    if (!req.session.user && !req.session.solver) return res.redirect("/login");
    res.render("blockchainHistory", { blockchain: req.app.locals.blockchain });
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;