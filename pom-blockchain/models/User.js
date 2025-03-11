// models/User.js
const bcrypt = require("bcryptjs");

class User {
    constructor(username, password) {
        this.username = username;
        this.password = bcrypt.hashSync(password, 10);
    }

    static users = [];

    static findByUsername(username) {
        return this.users.find(u => u.username === username);
    }

    static register(username, password) {
        if (this.findByUsername(username)) return false;
        const user = new User(username, password);
        this.users.push(user);
        return true;
    }

    checkPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = User;