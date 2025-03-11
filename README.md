# pom-blockchain

Welcome to POM-Blockchain prototype, a decentralized problem-solving platform built with Node.js, Express, and a custom blockchain implementation. Users can submit problems, solvers propose solutions with welfare scores, and the blockchain records winning solutions with rewards. This project demonstrates a unique mechanism for incentivizing problem-solving through a winner-selection-score system.

# Features
**Users**: Submit one problem per round; accept or reject proposed solutions.

**Solvers**: Submit solutions with welfare scores for all current problems; finalize blocks to earn rewards.

**Blockchain**: Tracks problems, solutions, user responses, and solver scores with an acceptance rate per block.

**Scoring**: Cumulative Winner-Selection-Score with an adjustment factor ((1-DCP)*acceptance rate) for winners.

**Winning Rate**: Displays each solver’s success rate based on finalized blocks.

# Prerequisites
**Node.js**: Version 14.x or higher (download from https://nodejs.org/en).

A modern web browser (e.g., Chrome, Firefox).

# Project Structure
pom-blockchain/\
├── models/\
│   ├── Blockchain.js  # Blockchain logic and classes\
│   ├── User.js       # User model (simple in-memory storage)\
│   ├── Solver.js     # Solver model (simple in-memory storage)\
├── routes/\
│   ├── index.js      # Express routes for all endpoints\
├── views/\
│   ├── index.ejs     # Homepage with login/register links\
│   ├── login.ejs     # Login page\
│   ├── register.ejs  # Registration page\
│   ├── userDashboard.ejs  # User interface\
│   ├── solverDashboard.ejs  # Solver interface\
│   ├── solutionResponse.ejs  # Response page for users\
│   ├── blockchainHistory.ejs  # Blockchain history view\
├── server.js         # Main server file\
├── package.json      # Project dependencies and scripts\
└── README.md         # This file\

# How to Run
1, download all files

2, In Windows command prompt, find the root of the downlaoded files:\
cd path (e.g., cd C:\Users\Username\Desktop\pom-blockchain)

3, In Windows command prompt, type:\
npm install express ejs bcryptjs express-session\
npm start

4, Open your browser to http://localhost:3000

# Example Workflow
1, register User1, submit a problem "Match me to a driver".\
2, register User1, submit a problem "Match a driver to me".\
3, register Solver1, submit scores "5", "6" to User1 and User2. Multiple submissions are allowed.\
4, register Solver2, submit scores "6", "7" to User1 and User2. Solver2 has the highest winner-selection-score, therefore, Solver2's solution is send to all users.\
5, User1 logs in, sees Solver2’s solution, clicks "Respond," selects "Accept."\
6, User2 logs in, sees Solver2’s solution, clicks "Respond," selects "Accept."\
7, Solver2 logs in, click "Finalize Block". Observe that the adjustment score is changed for Solver2.\
8, In user or solver dashboard, check the information of the created block by clicking "View Blockchain History".
