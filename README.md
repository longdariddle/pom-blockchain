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
1, In Windows command prompt, type the following:\
git clone https://github.com/longdarider/pom-blockchain.git  
cd pom-blockchain\
npm start

2, Open your browser to http://localhost:3000
