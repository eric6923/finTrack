"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/Auth/userController");
const transactionController_1 = require("../controllers/user-feature/transactionController");
const paylaterController_1 = require("../controllers/user-feature/paylaterController");
const forgotPassword_1 = require("../controllers/Auth/forgotPassword");
const categoryController_1 = require("../controllers/user-feature/categoryController");
const passwordController_1 = require("../controllers/user-feature/password/passwordController");
const profitController_1 = require("../controllers/user-feature/profitController");
const userMiddleware_1 = require("../middleware/userMiddleware");
const checkOwner_1 = require("../middleware/checkOwner");
const controlPanelController_1 = require("../controllers/user-feature/controlPanelController");
const filterController_1 = require("../controllers/user-feature/filterController");
const router = express_1.default.Router();
// User registration request
router.post("/regrequest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.userRegister)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error during registration request." });
    }
}));
// User login
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.userLogin)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error during login." });
    }
}));
// Create a new transaction
router.post('/transaction/create', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.createTransaction)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error creating transaction." });
    }
}));
router.post('/category/create', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, categoryController_1.createCategory)(req, res);
}));
router.get('/category', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, categoryController_1.getCategoriesByUser)(req, res);
}));
router.delete('/category/:id', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, categoryController_1.deleteCategory)(req, res);
}));
// Get all categories created by a user
// Get all transactions for a user
router.get('/transactions', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.getAllTransactions)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching transactions." });
    }
}));
router.get('/transactions/paylater', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.getPayLaterTransactions)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching transactions." });
    }
}));
router.get('/transaction', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.getTransactions)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching transactions." });
    }
}));
// Get a specific transaction by ID
router.get('/transaction/:id', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.getTransactionById)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching transaction by ID." });
    }
}));
router.get('/bus', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.getBuses)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching bus." });
    }
}));
router.get('/agent', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.getAgents)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching agent" });
    }
}));
router.get('/operator', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.getOperators)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching operators" });
    }
}));
router.get('/total', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.getTotalCreditAndDebit)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching values" });
    }
}));
router.get('/balances', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.getUserBalance)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching Balances" });
    }
}));
//protected routes
// Update a transaction
router.put('/transaction/:id', userMiddleware_1.verifyUser, checkOwner_1.checkOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.updateTransaction)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error updating transaction." });
    }
}));
// Delete a transaction
router.delete('/transaction/:id', userMiddleware_1.verifyUser, checkOwner_1.checkOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, transactionController_1.deleteTransaction)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting transaction." });
    }
}));
router.post('/set-owner-password', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, passwordController_1.setOwnerPassword)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "error setting password" });
    }
}));
//paylater
router.post('/paylater/:transactionId', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, paylaterController_1.payLater)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "error clearing Dues" });
    }
}));
//filter
router.get('/filter-transaction', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, filterController_1.getFilteredTransactions)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "error fetching filters" });
    }
}));
//TP - profit
router.get('/profit', userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, profitController_1.calculateProfitByDateRange)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "error fetching profit value" });
    }
}));
//forgot password
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, forgotPassword_1.forgotPassword)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "error sending mail" });
    }
}));
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, forgotPassword_1.resetPassword)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "error resetting password" });
    }
}));
//protected routes
router.get('/settings', userMiddleware_1.verifyUser, checkOwner_1.checkOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield res.send("setting"); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "error seeing settings" });
    }
}));
exports.default = router;
