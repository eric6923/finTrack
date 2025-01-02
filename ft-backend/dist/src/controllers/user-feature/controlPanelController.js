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
exports.setOpeningBalance = exports.getOperators = exports.getAgents = exports.getBuses = exports.deleteOperator = exports.createOperator = exports.deleteAgent = exports.createAgent = exports.deleteBus = exports.createBus = exports.verifyControlPanelPassword = void 0;
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
// Delete a bus
const deleteBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // User ID from the authenticated user
    const busId = req.params.id ? Number(req.params.id) : null; // Bus ID from the request parameters
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    if (!busId) {
        return res.status(400).json({ message: 'Bus ID is required' });
    }
    try {
        // Check if the bus exists and belongs to the user
        const existingBus = yield client_1.default.bus.findFirst({
            where: {
                id: busId,
                userId, // Ensure the bus belongs to the authenticated user
            },
        });
        if (!existingBus) {
            return res.status(404).json({ message: 'Bus not found or does not belong to the user' });
        }
        // Delete the bus
        yield client_1.default.bus.delete({
            where: { id: busId },
        });
        return res.status(200).json({ message: 'Bus deleted successfully' });
    }
    catch (error) {
        console.error('Bus deletion error:', error);
        // More specific error handling
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    message: 'The bus does not exist or has already been deleted.',
                    error: error.message
                });
            }
        }
        return res.status(500).json({
            message: 'Error deleting bus',
            error: error instanceof Error ? error.message : error
        });
    }
});
exports.deleteBus = deleteBus;
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
// Delete an agent
const deleteAgent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Authenticated user's ID
    const agentId = req.params.id ? Number(req.params.id) : null; // Agent ID from the request params
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    if (!agentId) {
        return res.status(400).json({ message: 'Agent ID is required' });
    }
    try {
        // Check if the agent exists and belongs to the user
        const existingAgent = yield client_1.default.agent.findFirst({
            where: {
                id: agentId,
                userId, // Ensure the agent belongs to the authenticated user
            },
        });
        if (!existingAgent) {
            return res.status(404).json({ message: 'Agent not found or does not belong to the user' });
        }
        // Delete the agent
        yield client_1.default.agent.delete({
            where: { id: agentId },
        });
        return res.status(200).json({ message: 'Agent deleted successfully' });
    }
    catch (error) {
        console.error('Agent deletion error:', error);
        // More specific error handling
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    message: 'The agent does not exist or has already been deleted.',
                    error: error.message,
                });
            }
        }
        return res.status(500).json({
            message: 'Error deleting agent',
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.deleteAgent = deleteAgent;
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
// Delete an operator
const deleteOperator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Authenticated user's ID
    const operatorId = req.params.id ? Number(req.params.id) : null; // Operator ID from the request params
    if (!userId) {
        return res.status(401).json({ message: 'User authentication failed' });
    }
    if (!operatorId) {
        return res.status(400).json({ message: 'Operator ID is required' });
    }
    try {
        // Check if the operator exists and belongs to the user
        const existingOperator = yield client_1.default.operator.findFirst({
            where: {
                id: operatorId,
                userId, // Ensure the operator belongs to the authenticated user
            },
        });
        if (!existingOperator) {
            return res.status(404).json({ message: 'Operator not found or does not belong to the user' });
        }
        // Delete the operator
        yield client_1.default.operator.delete({
            where: { id: operatorId },
        });
        return res.status(200).json({ message: 'Operator deleted successfully' });
    }
    catch (error) {
        console.error('Operator deletion error:', error);
        // More specific error handling
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    message: 'The operator does not exist or has already been deleted.',
                    error: error.message,
                });
            }
        }
        return res.status(500).json({
            message: 'Error deleting operator',
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.deleteOperator = deleteOperator;
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
//  export const setOpeningBalance = async (req: CustomRequest, res: Response) => {
//   try {
//     const userId = req.user?.id; 
//     console.log('Starting setOpeningBalance with userId:', userId);
//     const { boxBalance, accountBalance } = req.body;
//     console.log('Received balances:', { boxBalance, accountBalance });
//     if (!userId) {
//       console.log('No userId found');
//       return res.status(401).json({ message: "Unauthorized access." });
//     }
//     // Update user balances first
//     console.log('Updating user balances...');
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         boxBalance: parseFloat(boxBalance),
//         accountBalance: parseFloat(accountBalance),
//       },
//       select: {
//         id: true,
//         name: true,
//         boxBalance: true,
//         accountBalance: true,
//       },
//     });
//     console.log('User balances updated successfully:', updatedUser);
//     // Try creating categories separately
//     console.log('Starting category creation...');
//     const predefinedCategories = ['TEA', 'BUS BOOKING', 'MONEYTRANSFER', 'RENT'];
//     // Try a single category first as a test
//     console.log('Creating test category TEA...');
//     const testCategory = await prisma.category.create({
//       data: {
//         name: 'TEA',
//         createdBy: userId
//       }
//     });
//     console.log('Test category created:', testCategory);
//     // If test succeeds, create the rest
//     const categoryPromises = predefinedCategories.slice(1).map(name => 
//       prisma.category.create({
//         data: {
//           name,
//           createdBy: userId
//         }
//       })
//     );
//     const categories = await Promise.all(categoryPromises);
//     console.log('All categories created:', categories);
//     return res.status(200).json({
//       message: "Opening balances set successfully, and categories created.",
//       user: updatedUser,
//       totalBalance: parseFloat(boxBalance) + parseFloat(accountBalance),
//       categories
//     });
//   } catch (error) {
//     console.error("Detailed error in setOpeningBalance:", error);
//     console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
//     return res.status(500).json({ 
//       message: "An error occurred while setting up initial data.",
//       error: error instanceof Error ? error.message : "Unknown error"
//     });
//   }
// };
const setOpeningBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log("Starting setOpeningBalance with userId:", userId);
        const { boxBalance, accountBalance } = req.body;
        const boxBalanceNum = parseFloat(boxBalance) || 0; // Default to 0 if null/undefined
        const accountBalanceNum = parseFloat(accountBalance) || 0;
        console.log("Received balances:", { boxBalanceNum, accountBalanceNum });
        if (!userId) {
            console.log("No userId found");
            return res.status(401).json({ message: "Unauthorized access." });
        }
        // Update user balances
        console.log("Updating user balances...");
        const updatedUser = yield client_1.default.user.update({
            where: { id: userId },
            data: {
                boxBalance: boxBalanceNum,
                accountBalance: accountBalanceNum,
            },
            select: {
                id: true,
                name: true,
                boxBalance: true,
                accountBalance: true,
            },
        });
        console.log("User balances updated successfully:", updatedUser);
        // Create predefined categories
        console.log("Starting category creation...");
        const predefinedCategories = ['TEA', 'BUS BOOKING', 'MONEYTRANSFER', 'RENT'];
        const createdCategories = yield client_1.default.category.createMany({
            data: predefinedCategories.map((name) => ({
                name: name.toUpperCase(),
                createdBy: userId,
            })),
            skipDuplicates: true, // Prevent errors from duplicate entries
        });
        console.log("Categories created successfully:", createdCategories);
        return res.status(200).json({
            message: "Opening balances set successfully, and categories created.",
            user: updatedUser,
            totalBalance: boxBalanceNum + accountBalanceNum,
        });
    }
    catch (error) {
        console.error("Detailed error in setOpeningBalance:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            body: req.body,
        });
        return res.status(500).json({
            message: "An error occurred while setting up initial data.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.setOpeningBalance = setOpeningBalance;
