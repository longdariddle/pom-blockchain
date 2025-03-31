const Blockchain = require("./models/Blockchain");
const User = require("./models/User");
const Solver = require("./models/Solver");

// Simulation parameters
const NUM_USERS = 1000;
const NUM_SOLVERS = 500;
const ACCEPTANCE_PROBABILITY = 0.8;

// Initialize blockchain
const blockchain = new Blockchain();

// Timing utility
const measureTime = async (label, fn) => {
    console.log(`Starting ${label}...`);
    const start = performance.now();
    await fn();
    const end = performance.now();
    const duration = (end - start) / 1000; // Convert to seconds
    console.log(`${label} completed in ${duration.toFixed(3)} seconds`);
    return duration;
};

// 1. Register all accounts (synchronous)
const registerAccounts = async () => {
    for (let i = 0; i < NUM_USERS; i++) {
        User.register(`user${i}`, `pass${i}`);
        if (i % 100 === 0) console.log(`Registered ${i} users...`);
    }
    for (let i = 0; i < NUM_SOLVERS; i++) {
        Solver.register(`solver${i}`, `pass${i}`);
        blockchain.registerSolver(`solver${i}`);
        if (i % 100 === 0) console.log(`Registered ${i} solvers...`);
    }
};

// 2. Users submit problems
const submitProblems = async () => {
    const problemPromises = [];
    for (let i = 0; i < NUM_USERS; i++) {
        problemPromises.push(
            Promise.resolve(blockchain.addProblem(`Problem ${i}`, `user${i}`))
        );
        if (i % 100 === 0) console.log(`Submitted ${i} problems...`);
    }
    await Promise.all(problemPromises);
};

// 3. Solvers submit solutions
const submitSolutions = async () => {
    const solutionPromises = [];
    for (let i = 0; i < NUM_SOLVERS; i++) {
        const solverUsername = `solver${i}`;
        const problemIds = blockchain.currentProblems.map(p => p.id);
        const welfareScores = problemIds.reduce((acc, id) => {
            acc[id] = Math.floor(Math.random() * 101); // Random [0, 100]
            return acc;
        }, {});
        solutionPromises.push(
            Promise.resolve(blockchain.submitSolution(solverUsername, problemIds, welfareScores))
        );
        if (i % 100 === 0) console.log(`Submitted solutions for ${i} solvers...`);
    }
    await Promise.all(solutionPromises);
};

// 4. Users respond to the winning solution
const submitResponses = async () => {
    const winningSolution = blockchain.selectBestSolution();
    if (!winningSolution) throw new Error("No winning solution found");
    blockchain.winningSolution = winningSolution;

    const responsePromises = [];
    for (let i = 0; i < NUM_USERS; i++) {
        const problem = blockchain.currentProblems.find(p => p.user === `user${i}`);
        const accept = Math.random() < ACCEPTANCE_PROBABILITY;
        responsePromises.push(
            Promise.resolve(blockchain.submitResponse(problem.id, `user${i}`, accept))
        );
        if (i % 100 === 0) console.log(`Submitted ${i} responses...`);
    }
    await Promise.all(responsePromises);

    const acceptanceRate = blockchain.calculateAcceptanceRate(winningSolution);
    blockchain.updateWinnerSelectionScores(winningSolution, acceptanceRate);
};

// 5. Finalize block
const finalizeBlock = async () => {
    const winningSolution = blockchain.winningSolution;
    if (!winningSolution) throw new Error("No winning solution to finalize");
    await Promise.resolve(blockchain.finalizeBlock(winningSolution.solver));
};

// Main simulation (one round)
const runSimulation = async () => {
    console.log("Starting POM-Blockchain Stress Test Simulation (1 Round)...");
    const timings = {};

    timings.registration = await measureTime("Registration", registerAccounts);
    timings.problemSubmission = await measureTime("Problem Submission", submitProblems);
    timings.solutionSubmission = await measureTime("Solution Submission", submitSolutions);
    timings.userResponses = await measureTime("User Responses", submitResponses);
    timings.blockFinalization = await measureTime("Block Finalization", finalizeBlock);

    const totalTime = Object.values(timings).reduce((a, b) => a + b, 0);
    console.log("\nSummary:");
    console.log(`Total Time to Complete 1 Round: ${totalTime.toFixed(3)} seconds`);
    console.log("Timings by Stage:", timings);

    console.log(`Block #${blockchain.chain.length}: Winner = ${blockchain.chain[0].solver}`);
    console.log(`Acceptance Rate: ${blockchain.chain[0].acceptanceRate.toFixed(2)}`);
};

// Run the simulation
(async () => {
    try {
        await runSimulation();
    } catch (err) {
        console.error("Simulation failed:", err);
    }
})();