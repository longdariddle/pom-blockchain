// models/Solver.js
const bcrypt = require("bcryptjs");

class Solver {
    constructor(username, password) {
        this.username = username;
        this.password = bcrypt.hashSync(password, 10);
    }

    static solvers = [];

    static findByUsername(username) {
        return this.solvers.find(s => s.username === username);
    }

    static register(username, password) {
        if (this.findByUsername(username)) return false;
        const solver = new Solver(username, password);
        this.solvers.push(solver);
        return true;
    }

    checkPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = Solver;