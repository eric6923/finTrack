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
exports.setOpeningBalance = exports.getOperators = exports.getAgents = exports.getBuses = exports.createOperator = exports.createAgent = exports.createBus = exports.verifyControlPanelPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = __importDefault(require("../../../prisma/client"));
const client_2 = require("@prisma/client");
const verifyControlPanelPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { password } = req.body; // Password provided by the user
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // User ID from the verified token
        // Validate required inputs
        if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in the token.' });
        }
        // Fetch the hashed owner password from the database
        const ownerPasswordRecord = yield client_1.default.ownerPassword.findUnique({
            where: { userId },
        });
        if (!ownerPasswordRecord) {
            return res.status(404).json({ message: 'Owner password not set for this user.' });
        }
        // Compare the provided password with the stored hashed password
        const isValidPassword = yield bcrypt_1.default.compare(password, ownerPasswordRecord.password);
        if (!isValidPassword) {
            return res.status(403).json({ message: 'Invalid password.' });
        }
        // If the password is valid, return success
        res.status(200).json({ message: 'Password verified successfully.' });
    }
    catch (error) {
        console.error('Error verifying control panel password:', error);
        res.status(500).json({ message: 'Error verifying password.' });
    }
});
exports.verifyControlPanelPassword = verifyControlPanelPassword;
const createBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name } = req.body;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const normalizedName = name.trim().toUpperCase();
    if (!normalizedName) {
        return res.status(400).json({ message: 'Bus name is required' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    try {
        // First, verify that the user exists
        const existingUser = yield client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if a bus with this name already exists for this user
        const existingBus = yield client_1.default.bus.findFirst({
            where: {
                name: normalizedName,
                userId, // Ensure that the bus name is unique to this user
            },
        });
        if (existingBus) {
            return res.status(400).json({ message: 'A bus with this name already exists for this user' });
        }
        // Create the bus
        const bus = yield client_1.default.bus.create({
            data: {
                name: normalizedName,
                userId,
            },
        });
        return res.status(201).json(bus);
    }
    catch (error) {
        console.error('Bus creation error:', error);
        // More specific error handling
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return res.status(500).json({
                    message: 'Foreign key constraint failed. Ensure the user exists.',
                    error: error.message
                });
            }
        }
        return res.status(500).json({
            message: 'Error creating bus',
            error: error instanceof Error ? error.message : error
        });
    }
});
exports.createBus = createBus;
const createAgent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name } = req.body;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const normalizedName = name.trim().toUpperCase();
    if (!normalizedName) {
        return res.status(400).json({ message: 'Agent name is required' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    try {
        // First, verify that the user exists
        const existingUser = yield client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if an agent with this name already exists for this user
        const existingAgent = yield client_1.default.agent.findFirst({
            where: {
                name: normalizedName,
                userId, // Ensure the agent name is unique for this user
            },
        });
        if (existingAgent) {
            return res.status(400).json({ message: 'An agent with this name already exists for this user' });
        }
        // Create the agent
        const agent = yield client_1.default.agent.create({
            data: {
                name: normalizedName,
                userId,
            },
        });
        return res.status(201).json(agent);
    }
    catch (error) {
        console.error('Agent creation error:', error);
        // More specific error handling
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return res.status(500).json({
                    message: 'Foreign key constraint failed. Ensure the user exists.',
                    error: error.message
                });
            }
            if (error.code === 'P2002') {
                return res.status(400).json({
                    message: 'An agent with this name already exists',
                    error: error.message
                });
            }
        }
        return res.status(500).json({
            message: 'Error creating agent',
            error: error instanceof Error ? error.message : error
        });
    }
});
exports.createAgent = createAgent;
const createOperator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name } = req.body;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const normalizedName = name.trim().toUpperCase();
    if (!normalizedName) {
        return res.status(400).json({ message: 'Operator name is required' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    try {
        // First, verify that the user exists
        const existingUser = yield client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if an operator with this name already exists for this user
        const existingOperator = yield client_1.default.operator.findFirst({
            where: {
                name: normalizedName,
                userId, // Ensure the operator name is unique for this user
            },
        });
        if (existingOperator) {
            return res.status(400).json({ message: 'An operator with this name already exists for this user' });
        }
        // Create the operator
        const operator = yield client_1.default.operator.create({
            data: {
                name: normalizedName,
                userId,
            },
        });
        return res.status(201).json(operator);
    }
    catch (error) {
        console.error('Operator creation error:', error);
        // More specific error handling
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return res.status(500).json({
                    message: 'Foreign key constraint failed. Ensure the user exists.',
                    error: error.message
                });
            }
            if (error.code === 'P2002') {
                return res.status(400).json({
                    message: 'An operator with this name already exists',
                    error: error.message
                });
            }
        }
        return res.status(500).json({
            message: 'Error creating operator',
            error: error instanceof Error ? error.message : error
        });
    }
});
exports.createOperator = createOperator;
const getBuses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    try {
        // Fetch all buses for the authenticated user
        const buses = yield client_1.default.bus.findMany({
            where: { userId },
        });
        if (!buses || buses.length === 0) {
            return res.status(200).json({ message: 'No buses found for this user' });
        }
        return res.status(200).json(buses);
    }
    catch (error) {
        console.error('Error fetching buses:', error);
        return res.status(500).json({
            message: 'Error fetching buses',
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.getBuses = getBuses;
const getAgents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    try {
        // Fetch all agents for the authenticated user
        const agents = yield client_1.default.agent.findMany({
            where: { userId },
        });
        if (!agents || agents.length === 0) {
            return res.status(200).json({ message: 'No agents found for this user' });
        }
        return res.status(200).json(agents);
    }
    catch (error) {
        console.error('Error fetching agents:', error);
        return res.status(500).json({
            message: 'Error fetching agents',
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.getAgents = getAgents;
const getOperators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    try {
        // Fetch all operators for the authenticated user
        const operators = yield client_1.default.operator.findMany({
            where: { userId },
        });
        if (!operators || operators.length === 0) {
            return res.status(200).json({ message: 'No operators found for this user' });
        }
        return res.status(200).json(operators);
    }
    catch (error) {
        console.error('Error fetching operators:', error);
        return res.status(500).json({
            message: 'Error fetching operators',
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.getOperators = getOperators;
const setOpeningBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Extract user ID from token
        const { boxBalance, accountBalance } = req.body;
        // Ensure user ID is provided
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }
        // Validate the balances
        if (boxBalance === undefined || accountBalance === undefined) {
            return res
                .status(400)
                .json({ message: "Both boxBalance and accountBalance are required." });
        }
        if (isNaN(parseFloat(boxBalance)) || isNaN(parseFloat(accountBalance))) {
            return res
                .status(400)
                .json({ message: "Both balances must be valid numbers." });
        }
        const totalBalance = parseFloat(boxBalance) + parseFloat(accountBalance);
        // Update the user's balances in the database
        const updatedUser = yield client_1.default.user.update({
            where: { id: userId },
            data: {
                boxBalance: parseFloat(boxBalance),
                accountBalance: parseFloat(accountBalance),
            },
            select: {
                id: true,
                name: true,
                boxBalance: true,
                accountBalance: true,
            },
        });
        // Define the predefined categories
        const predefinedCategories = ['TEA', 'BUSBOOKING', 'MONEYTRANSFER', 'RENT'];
        // Loop through the categories and create them if they don't exist
        for (const categoryName of predefinedCategories) {
            const existingCategory = yield client_1.default.category.findFirst({
                where: { name: categoryName },
            });
            if (!existingCategory) {
                // Create the category if it doesn't exist
                yield client_1.default.category.create({
                    data: {
                        name: categoryName,
                        createdBy: userId,
                    },
                });
            }
        }
        return res.status(200).json({
            message: "Opening balances set successfully, and categories created.",
            user: updatedUser,
            totalBalance,
        });
    }
    catch (error) {
        console.error("Error setting opening balance:", error);
        return res.status(500).json({ message: "An error occurred.", error });
    }
});
exports.setOpeningBalance = setOpeningBalance;
