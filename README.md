# pom-blockchain
POM-Blockchain prototype
Welcome to POM-Blockchain, a decentralized problem-solving platform built with Node.js, Express, and a custom blockchain implementation. Users can submit problems, solvers propose solutions with welfare scores, and the blockchain records winning solutions with rewards. This project demonstrates a unique mechanism for incentivizing problem-solving through a winner-selection-score system.

Features
Users: Submit one problem per round; accept or reject proposed solutions.
Solvers: Submit solutions with welfare scores for all current problems; finalize blocks to earn rewards.
Blockchain: Tracks problems, solutions, user responses, and solver scores with an acceptance rate per block.
Scoring: Cumulative winnerSelectionScore with an adjustment factor (DCP = 0.6) for winners.
Winning Rate: Displays each solver’s success rate based on finalized blocks.
Prerequisites
Node.js: Version 14.x or higher.
npm: Comes with Node.js.
A modern web browser (e.g., Chrome, Firefox).
