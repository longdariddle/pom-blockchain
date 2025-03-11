const crypto = require("crypto");

const DCP = 0.6;
const REWARD = 100;

class Problem {
    constructor(id, description, user, blockNumber) {
        this.id = `${blockNumber}-${id}`;
        this.description = description;
        this.user = user;
    }
}

class Solution {
    constructor(solver, problemIds, welfareScores, problems) {
        this.solver = solver;
        this.problemIds = problemIds;
        this.welfareScores = welfareScores;
        this.totalWelfare = Object.values(welfareScores).reduce((a, b) => a + b, 0);
        this.timestamp = Date.now();
        this.problemDetails = problemIds.map(id => ({
            id,
            description: problems.find(p => p.id === id).description,
            user: problems.find(p => p.id === id).user
        }));
    }
}

class Solver {
    constructor(username) {
        this.username = username;
        this.winnerSelectionScore = 0; // Cumulative across rounds
        this.adjustmentScore = 1;
        this.wallet = 0;
        this.latestTotalWelfare = 0; // Latest within current round
        this.latestSolution = null;
        this.roundStartScore = 0; // Score at start of current round
    }
}

class Blockchain {
    constructor() {
        this.chain = [];
        this.currentProblems = [];
        this.solutions = [];
        this.solvers = {};
        this.userResponses = [];
        this.pendingSolution = null;
        this.winningSolution = null;
    }

    addProblem(description, user) {
        const blockNumber = this.chain.length + 1;
        const problem = new Problem(this.currentProblems.length, description, user, blockNumber);
        this.currentProblems.push(problem);
        return problem;
    }

    registerSolver(username) {
        if (!this.solvers[username]) {
            this.solvers[username] = new Solver(username);
        }
    }

    submitSolution(solverUsername, problemIds, welfareScores) {
        if (!this.solvers[solverUsername]) return false;
        const invalidIds = problemIds.filter(id => !this.currentProblems.some(p => p.id === id));
        if (invalidIds.length > 0) return false;
        for (let score of Object.values(welfareScores)) {
            if (score < 0 || score > 100) return false;
        }
        const solution = new Solution(solverUsername, problemIds, welfareScores, this.currentProblems);
        
        const solver = this.solvers[solverUsername];
        const prevSolution = solver.latestSolution;

        const isIdentical = prevSolution && 
            JSON.stringify(prevSolution.problemIds.sort()) === JSON.stringify(problemIds.sort()) &&
            JSON.stringify(prevSolution.welfareScores) === JSON.stringify(welfareScores);

        if (!isIdentical) {
            this.solutions = this.solutions.filter(s => s.solver !== solverUsername);
            this.solutions.push(solution);

            // Within round: replace previous contribution with new one
            if (solver.latestSolution) {
                solver.winnerSelectionScore -= solver.latestTotalWelfare * solver.adjustmentScore;
            }
            solver.latestTotalWelfare = solution.totalWelfare;
            solver.winnerSelectionScore = solver.roundStartScore + (solution.totalWelfare * solver.adjustmentScore);
            solver.latestSolution = solution;
            console.log(`Updated ${solverUsername}'s score: ${solver.winnerSelectionScore}`);
        } else {
            if (!this.solutions.some(s => s.solver === solverUsername)) {
                this.solutions.push(solution);
            }
            console.log(`${solverUsername}'s score unchanged (identical submission): ${solver.winnerSelectionScore}`);
        }

        if (!this.winningSolution) {
            this.pendingSolution = this.selectBestSolution();
            this.broadcastSolution(this.pendingSolution);
            console.log("Pending solution updated:", this.pendingSolution);
        }
        return true;
    }

    finalizeBlock(solverUsername) {
        if (!this.winningSolution || this.userResponses.length < this.winningSolution.problemIds.length) {
            console.log("Cannot finalize: not all responses received or no winning solution");
            return false;
        }
        if (solverUsername !== this.winningSolution.solver) {
            console.log("Only the winning solver can finalize");
            return false;
        }
        this.solvers[solverUsername].wallet += REWARD;
        console.log(`${solverUsername} rewarded ${REWARD}, new wallet: ${this.solvers[solverUsername].wallet}`);
        this.createBlock(this.winningSolution);
        // Update roundStartScore for all solvers to carry over to next round
        for (let solver in this.solvers) {
            this.solvers[solver].roundStartScore = this.solvers[solver].winnerSelectionScore;
            this.solvers[solver].latestSolution = null; // Reset for new round
            this.solvers[solver].latestTotalWelfare = 0;
        }
        this.winningSolution = null;
        this.pendingSolution = null;
        return true;
    }

    selectBestSolution() {
        if (this.solutions.length === 0) return null;
        let maxScore = Math.max(...this.solutions.map(s => this.solvers[s.solver].winnerSelectionScore));
        let candidates = this.solutions.filter(s => this.solvers[s.solver].winnerSelectionScore === maxScore);
        const maxWelfare = Math.max(...candidates.map(s => s.totalWelfare));
        const welfareCandidates = candidates.filter(s => s.totalWelfare === maxWelfare);
        return welfareCandidates[0];
    }

    broadcastSolution(solution) {
        console.log(`Broadcasting solution by ${solution.solver}`);
    }

    updateWinnerSelectionScores(winningSolution, acceptanceRate) {
        for (let solverUsername in this.solvers) {
            const solver = this.solvers[solverUsername];
            if (solverUsername === winningSolution.solver) {
                solver.adjustmentScore = (1 - DCP) * acceptanceRate;
            } else {
                solver.adjustmentScore = 1;
            }
            console.log(`${solverUsername}'s new adjustmentScore: ${solver.adjustmentScore}`);
        }
    }

    createBlock(winningSolution) {
        const block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            solver: winningSolution.solver,
            transactions: winningSolution.problemIds,
            solutions: this.solutions,
            problemDetails: winningSolution.problemDetails,
            userResponses: [...this.userResponses],
            solversState: Object.fromEntries(
                Object.entries(this.solvers).map(([username, solver]) => [
                    username,
                    { wallet: solver.wallet, winnerSelectionScore: solver.winnerSelectionScore }
                ])
            ),
            previousHash: this.chain.length ? this.chain[this.chain.length - 1].hash : "0",
            hash: crypto.createHash("sha256").update(JSON.stringify(winningSolution)).digest("hex"),
        };
        this.chain.push(block);
        this.currentProblems = this.currentProblems.filter(p => !winningSolution.problemIds.includes(p.id));
        this.solutions = [];
        this.userResponses = [];
    }

    submitResponse(problemId, user, accept) {
        if (!this.userResponses.some(r => r.problemId === problemId && r.user === user)) {
            this.userResponses.push({ problemId, user, accept });
            if (accept && !this.winningSolution) {
                this.winningSolution = this.pendingSolution;
                console.log("Solution locked as winning:", this.winningSolution);
            }
            if (this.winningSolution && this.userResponses.length === this.winningSolution.problemIds.length) {
                const acceptanceRate = this.calculateAcceptanceRate(this.winningSolution);
                this.updateWinnerSelectionScores(this.winningSolution, acceptanceRate);
            }
        } else {
            console.log(`${user} has already responded to problem ${problemId}`);
        }
    }

    calculateAcceptanceRate(winningSolution) {
        const relevantResponses = this.userResponses.filter(r => 
            winningSolution.problemIds.includes(r.problemId)
        );
        const accepted = relevantResponses.filter(r => r.accept).length;
        return relevantResponses.length > 0 ? accepted / relevantResponses.length : 0;
    }
}

module.exports = Blockchain;