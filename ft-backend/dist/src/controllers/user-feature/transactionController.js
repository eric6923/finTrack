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
exports.getUserBalance = exports.getTotalCreditAndDebit = exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getAllTransactions = exports.getPayLaterTransactions = exports.getTransactions = exports.createTransaction = void 0;
const client_1 = __importDefault(require("../../../prisma/client"));
const date_fns_1 = require("date-fns");
const library_1 = require("@prisma/client/runtime/library");
// Create a transaction
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const logType = req.query.logType;
        if (logType !== "CREDIT" && logType !== "DEBIT") {
            return res.status(400).json({ message: 'Invalid logType. Must be either "CREDIT" or "DEBIT".' });
        }
        const { desc, amount, modeOfPayment, transactionNo, categoryId, remarks, payLater, payLaterDetails, commission, collection, } = req.body;
        if (!amount || isNaN(parseFloat(amount))) {
            return res.status(400).json({ message: "Invalid amount provided." });
        }
        const parsedAmount = new library_1.Decimal(amount);
        if (payLater && logType !== "CREDIT") {
            return res.status(400).json({ message: "PayLater can only be true for CREDIT transactions." });
        }
        if ((!desc || desc.trim() === "") && !(logType === "CREDIT" && payLater)) {
            return res.status(400).json({
                message: "Description is required unless logType is CREDIT and PayLater is true.",
            });
        }
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
            select: { boxBalance: true, accountBalance: true, due: true },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        let updatedBoxBalance = user.boxBalance || new library_1.Decimal(0);
        let updatedAccountBalance = user.accountBalance || new library_1.Decimal(0);
        let updatedDueBalance = user.due || new library_1.Decimal(0);
        if (logType === 'DEBIT') {
            const category = yield client_1.default.category.findUnique({
                where: { id: categoryId },
            });
            if (category && category.name.endsWith(' FINANCE')) {
                const shareholderName = category.name.replace(' FINANCE', '').trim();
                const shareholder = yield client_1.default.shareholder.findFirst({
                    where: {
                        name: shareholderName,
                        companyShareDetails: {
                            userId: userId,
                        },
                    },
                });
                if (!shareholder) {
                    return res.status(400).json({
                        message: 'Shareholder not found for this finance category.',
                    });
                }
                const debitAmount = new library_1.Decimal(amount);
                yield client_1.default.shareholder.update({
                    where: { id: shareholder.id },
                    data: {
                        finance: shareholder.finance.add(debitAmount),
                    },
                });
            }
        }
        if (modeOfPayment === "CASH") {
            if (logType === "CREDIT") {
                updatedBoxBalance = updatedBoxBalance.add(parsedAmount);
            }
            else if (logType === "DEBIT") {
                if (updatedBoxBalance.lessThan(parsedAmount)) {
                    return res.status(400).json({ message: "Insufficient box balance." });
                }
                updatedBoxBalance = updatedBoxBalance.sub(parsedAmount);
            }
        }
        else if (modeOfPayment === "UPI") {
            if (logType === "CREDIT") {
                updatedAccountBalance = updatedAccountBalance.add(parsedAmount);
            }
            else if (logType === "DEBIT") {
                if (updatedAccountBalance.lessThan(parsedAmount)) {
                    return res.status(400).json({ message: "Insufficient account balance." });
                }
                updatedAccountBalance = updatedAccountBalance.sub(parsedAmount);
            }
        }
        yield client_1.default.user.update({
            where: { id: userId },
            data: {
                boxBalance: updatedBoxBalance,
                accountBalance: updatedAccountBalance,
            },
        });
        if (logType === "CREDIT" && payLater) {
            if (!(payLaterDetails === null || payLaterDetails === void 0 ? void 0 : payLaterDetails.from) || !(payLaterDetails === null || payLaterDetails === void 0 ? void 0 : payLaterDetails.to) || !(payLaterDetails === null || payLaterDetails === void 0 ? void 0 : payLaterDetails.travelDate)) {
                return res.status(400).json({
                    message: "Bus details (from, to, travelDate) are required when PayLater is true.",
                });
            }
            if (!collection || !collection.operatorId || !collection.amount) {
                return res.status(400).json({
                    message: "Collection details (operatorId, amount) are required when PayLater is true.",
                });
            }
            const bus = yield client_1.default.bus.findUnique({
                where: { id: payLaterDetails.busId },
            });
            if (!bus) {
                return res.status(404).json({ message: "Bus not found." });
            }
            const operator = yield client_1.default.operator.findUnique({
                where: { id: collection.operatorId },
            });
            if (!operator) {
                return res.status(404).json({ message: "Operator not found." });
            }
            let agent = null;
            if (commission && commission.agentId) {
                agent = yield client_1.default.agent.findUnique({
                    where: { id: commission.agentId },
                });
                if (!agent) {
                    return res.status(404).json({ message: "Agent not found." });
                }
            }
            req.body.dueAmount = new library_1.Decimal(collection.amount).add((commission === null || commission === void 0 ? void 0 : commission.amount) ? new library_1.Decimal(commission.amount) : new library_1.Decimal(0));
            const transaction = yield client_1.default.transaction.create({
                data: Object.assign({ userId,
                    logType,
                    desc, amount: parsedAmount, modeOfPayment,
                    transactionNo,
                    categoryId,
                    remarks,
                    payLater, dueAmount: req.body.dueAmount, payLaterDetails: {
                        create: {
                            busId: bus.id,
                            from: payLaterDetails.from,
                            to: payLaterDetails.to,
                            travelDate: new Date(payLaterDetails.travelDate),
                        },
                    }, collection: {
                        create: {
                            operatorId: collection.operatorId,
                            amount: new library_1.Decimal(collection.amount),
                            remainingDue: new library_1.Decimal(collection.amount), // Set initial remainingDue equal to amount
                        },
                    } }, ((commission === null || commission === void 0 ? void 0 : commission.agentId) && (commission === null || commission === void 0 ? void 0 : commission.amount) && {
                    commission: {
                        create: {
                            agentId: commission.agentId,
                            amount: new library_1.Decimal(commission.amount),
                            remainingDue: new library_1.Decimal(commission.amount), // Set initial remainingDue equal to amount
                        },
                    },
                })),
                include: {
                    category: true,
                    payLaterDetails: true,
                    commission: true,
                    collection: true,
                },
            });
            yield client_1.default.user.update({
                where: { id: userId },
                data: {
                    due: updatedDueBalance.add(req.body.dueAmount),
                },
            });
            return res.status(201).json({
                transaction,
                balances: {
                    boxBalance: updatedBoxBalance.toString(),
                    accountBalance: updatedAccountBalance.toString(),
                    due: updatedDueBalance.add(req.body.dueAmount).toString(),
                },
            });
        }
        const transaction = yield client_1.default.transaction.create({
            data: {
                userId,
                logType,
                desc,
                amount: parsedAmount,
                modeOfPayment,
                transactionNo,
                categoryId,
                remarks,
                payLater: false,
            },
            include: {
                category: true,
            },
        });
        return res.status(201).json({
            transaction,
            balances: {
                boxBalance: updatedBoxBalance.toString(),
                accountBalance: updatedAccountBalance.toString(),
                due: updatedDueBalance.toString(),
            },
        });
    }
    catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Error creating transaction", error });
    }
});
exports.createTransaction = createTransaction;
// Helper function to calculate total profit by month
const getTotalProfitByMonth = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield client_1.default.transaction.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                logType: 'CREDIT',
                OR: [
                    { payLater: false },
                    { payLater: true, dueAmount: 0 },
                ],
            },
            include: {
                commission: true,
                collection: true,
            },
        });
        const totalProfit = transactions.reduce((sum, transaction) => {
            var _a, _b;
            const agentAmount = ((_a = transaction.commission) === null || _a === void 0 ? void 0 : _a.amount.toNumber()) || 0;
            const operatorAmount = ((_b = transaction.collection) === null || _b === void 0 ? void 0 : _b.amount.toNumber()) || 0;
            const profit = transaction.amount.toNumber() - (agentAmount + operatorAmount);
            return sum + profit;
        }, 0);
        return totalProfit;
    }
    catch (error) {
        console.error('Error calculating monthly profit:', error);
        return 0;
    }
});
// Get all transactions for a user
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const { Date: dateParam, startDate, endDate } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }
        // Handle date range filtering (startDate and endDate)
        if (startDate && endDate) {
            let parsedStartDate, parsedEndDate;
            try {
                parsedStartDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(String(startDate)));
                parsedEndDate = (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(String(endDate)));
            }
            catch (error) {
                return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD for startDate and endDate.' });
            }
            return getTransactionsForPeriod(userId, parsedStartDate, parsedEndDate, res);
        }
        // Check if the Date parameter is in YYYY-MM-DD or YYYY-MM format
        const dateParts = dateParam && typeof dateParam === 'string' ? dateParam.split('-') : [];
        // If it's a full date (YYYY-MM-DD), filter for that specific day
        if (dateParts.length === 3) {
            const [year, month, day] = dateParts;
            const fullDate = `${year}-${month}-${day}`;
            let parsedDate;
            try {
                parsedDate = (0, date_fns_1.parseISO)(fullDate);
            }
            catch (error) {
                return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
            }
            const startOfDayUTC = (0, date_fns_1.startOfDay)(parsedDate);
            const endOfDayUTC = (0, date_fns_1.endOfDay)(parsedDate);
            return getTransactionsForPeriod(userId, startOfDayUTC, endOfDayUTC, res);
        }
        // If it's a month (YYYY-MM), filter for the entire month
        if (dateParts.length === 2) {
            const [year, month] = dateParts;
            let parsedMonth;
            try {
                parsedMonth = new Date(`${year}-${month}-01`);
            }
            catch (error) {
                return res.status(400).json({ message: 'Invalid month format. Please use YYYY-MM.' });
            }
            const startOfMonthUTC = (0, date_fns_1.startOfMonth)(parsedMonth);
            const endOfMonthUTC = (0, date_fns_1.endOfMonth)(parsedMonth);
            return getTransactionsForPeriod(userId, startOfMonthUTC, endOfMonthUTC, res);
        }
        res.status(400).json({ message: 'Invalid Date format. Please use YYYY-MM-DD, YYYY-MM, or provide startDate and endDate.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
});
exports.getTransactions = getTransactions;
const getPayLaterTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!userId) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }
        // Fetch transactions where payLater is true (payLaterDetails is not null)
        const transactions = yield client_1.default.transaction.findMany({
            where: {
                userId: userId,
                payLaterDetails: {
                    isNot: null, // Filter only transactions with payLater details
                },
            },
            include: {
                category: true,
                payLaterDetails: true,
                commission: true,
                collection: true,
            },
        });
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No pay later transactions found.' });
        }
        return res.status(200).json(transactions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pay later transactions', error });
    }
});
exports.getPayLaterTransactions = getPayLaterTransactions;
// Helper function to handle the filtering of transactions by date range
const getTransactionsForPeriod = (userId, startDate, endDate, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield client_1.default.transaction.findMany({
        where: {
            userId: userId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            category: true,
            payLaterDetails: true,
            commission: true,
            collection: true,
        },
    });
    if (transactions.length === 0) {
        return res.status(404).json({ message: 'No logs found for the selected period.' });
    }
    return res.status(200).json(transactions);
});
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Ensure it's a number
        if (!userId) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }
        const transactions = yield client_1.default.transaction.findMany({
            where: { userId: userId }, // Ensure userId is correctly passed
            include: {
                category: true,
                payLaterDetails: true,
                commission: true,
                collection: true,
            },
        });
        res.status(200).json(transactions); // Return the transactions
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
});
exports.getAllTransactions = getAllTransactions;
// Get a specific transaction by ID
const getTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Get userId from token
        const transaction = yield client_1.default.transaction.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                category: true,
                payLaterDetails: true,
                commission: true,
                collection: true,
            },
        });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        // Check if the user is authorized to view the transaction
        if (transaction.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to view this transaction.' });
        }
        res.status(200).json(transaction);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transaction', error });
    }
});
exports.getTransactionById = getTransactionById;
// Update a transaction
// Update a transaction
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Get userId from token
        const { password, transaction } = req.body; // Extract password and transaction fields
        if (!transaction) {
            return res.status(400).json({ message: 'Transaction data is required.' });
        }
        // Check if the transaction exists
        const existingTransaction = yield client_1.default.transaction.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!existingTransaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        // Check if the user is authorized to update the transaction
        if (existingTransaction.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this transaction.' });
        }
        // Prepare the update object
        const updateData = {
            desc: transaction.desc,
            amount: transaction.amount,
            modeOfPayment: transaction.modeOfPayment,
            transactionNo: transaction.transactionNo,
            categoryId: transaction.categoryId,
            remarks: transaction.remarks,
            payLater: transaction.payLater,
        };
        // Handle nested updates for payLaterDetails
        if (transaction.payLaterDetails) {
            updateData.payLaterDetails = {
                upsert: {
                    create: {
                        from: transaction.payLaterDetails.from,
                        to: transaction.payLaterDetails.to,
                        travelDate: new Date(transaction.payLaterDetails.travelDate),
                        busId: transaction.payLaterDetails.busId,
                    },
                    update: {
                        from: transaction.payLaterDetails.from,
                        to: transaction.payLaterDetails.to,
                        travelDate: new Date(transaction.payLaterDetails.travelDate),
                        busId: transaction.payLaterDetails.busId,
                    },
                },
            };
        }
        // Handle nested updates for commission
        if (transaction.commission) {
            updateData.commission = {
                upsert: {
                    create: {
                        agentId: transaction.commission.agentId,
                        amount: transaction.commission.amount,
                    },
                    update: {
                        agentId: transaction.commission.agentId,
                        amount: transaction.commission.amount,
                    },
                },
            };
        }
        // Handle nested updates for collection
        if (transaction.collection) {
            updateData.collection = {
                upsert: {
                    create: {
                        operatorId: transaction.collection.operatorId,
                        amount: transaction.collection.amount,
                    },
                    update: {
                        operatorId: transaction.collection.operatorId,
                        amount: transaction.collection.amount,
                    },
                },
            };
        }
        // Update the transaction
        const updatedTransaction = yield client_1.default.transaction.update({
            where: { id: parseInt(id, 10) },
            data: updateData,
        });
        res.status(200).json({ message: 'Transaction successfully updated.', updatedTransaction });
    }
    catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Error updating transaction', error });
    }
});
exports.updateTransaction = updateTransaction;
// Delete a transaction
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Get userId from token
        // Find the transaction to be deleted
        const transaction = yield client_1.default.transaction.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        // Check if the user is authorized to delete the transaction
        if (transaction.userId !== userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this transaction.",
            });
        }
        // Fetch user balances
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
            select: {
                boxBalance: true,
                accountBalance: true,
                due: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Parse balances
        let updatedBoxBalance = new library_1.Decimal(user.boxBalance);
        let updatedAccountBalance = new library_1.Decimal(user.accountBalance);
        let updatedDueBalance = new library_1.Decimal(user.due);
        // Reverse transaction effect
        const transactionAmount = new library_1.Decimal(transaction.amount);
        if (transaction.modeOfPayment === "CASH") {
            if (transaction.logType === "CREDIT") {
                updatedBoxBalance = updatedBoxBalance.sub(transactionAmount); // Subtract credited amount
            }
            else if (transaction.logType === "DEBIT") {
                updatedBoxBalance = updatedBoxBalance.add(transactionAmount); // Add debited amount back
            }
        }
        else if (transaction.modeOfPayment === "UPI") {
            if (transaction.logType === "CREDIT") {
                updatedAccountBalance = updatedAccountBalance.sub(transactionAmount); // Subtract credited amount
            }
            else if (transaction.logType === "DEBIT") {
                updatedAccountBalance = updatedAccountBalance.add(transactionAmount); // Add debited amount back
            }
        }
        // Reverse due if PayLater was true
        if (transaction.payLater && transaction.logType === "CREDIT") {
            updatedDueBalance = updatedDueBalance.sub(transaction.dueAmount || new library_1.Decimal(0));
        }
        // Update user balances in the database
        yield client_1.default.user.update({
            where: { id: userId },
            data: {
                boxBalance: updatedBoxBalance,
                accountBalance: updatedAccountBalance,
                due: updatedDueBalance,
            },
        });
        // Delete the transaction
        yield client_1.default.transaction.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(200).json({
            message: "Transaction successfully deleted.",
            balances: {
                boxBalance: updatedBoxBalance.toString(),
                accountBalance: updatedAccountBalance.toString(),
                due: updatedDueBalance.toString(),
            },
        });
    }
    catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Error deleting transaction", error });
    }
});
exports.deleteTransaction = deleteTransaction;
// Helper function to calculate credit and debit totals for a specific date range
const getTotalsForPeriod = (userId, startDate, endDate, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const totals = yield client_1.default.transaction.groupBy({
        by: ['logType'],
        where: {
            userId: userId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        _sum: {
            amount: true,
        },
    });
    const totalCredit = ((_a = totals.find(t => t.logType === 'CREDIT')) === null || _a === void 0 ? void 0 : _a._sum.amount) || 0;
    const totalDebit = ((_b = totals.find(t => t.logType === 'DEBIT')) === null || _b === void 0 ? void 0 : _b._sum.amount) || 0;
    return res.status(200).json({
        totalCredit,
        totalDebit,
    });
});
const getTotalCreditAndDebit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Get the user ID from the token
        const { Date: dateParam, startDate, endDate } = req.query; // Get date-related query params
        if (!userId) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }
        // Handle custom date range filtering (startDate and endDate)
        if (startDate && endDate) {
            let parsedStartDate, parsedEndDate;
            try {
                parsedStartDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(String(startDate)));
                parsedEndDate = (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(String(endDate)));
            }
            catch (error) {
                return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD for startDate and endDate.' });
            }
            return getTotalsForPeriod(userId, parsedStartDate, parsedEndDate, res);
        }
        // Check if the Date parameter is in YYYY-MM-DD or YYYY-MM format
        const dateParts = dateParam && typeof dateParam === 'string' ? dateParam.split('-') : [];
        // If it's a full date (YYYY-MM-DD), filter for that specific day
        if (dateParts.length === 3) {
            const [year, month, day] = dateParts;
            const fullDate = `${year}-${month}-${day}`;
            let parsedDate;
            try {
                parsedDate = (0, date_fns_1.parseISO)(fullDate);
            }
            catch (error) {
                return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
            }
            const startOfDayUTC = (0, date_fns_1.startOfDay)(parsedDate);
            const endOfDayUTC = (0, date_fns_1.endOfDay)(parsedDate);
            return getTotalsForPeriod(userId, startOfDayUTC, endOfDayUTC, res);
        }
        // If it's a month (YYYY-MM), filter for the entire month
        if (dateParts.length === 2) {
            const [year, month] = dateParts;
            let parsedMonth;
            try {
                parsedMonth = new Date(`${year}-${month}-01`);
            }
            catch (error) {
                return res.status(400).json({ message: 'Invalid month format. Please use YYYY-MM.' });
            }
            const startOfMonthUTC = (0, date_fns_1.startOfMonth)(parsedMonth);
            const endOfMonthUTC = (0, date_fns_1.endOfMonth)(parsedMonth);
            return getTotalsForPeriod(userId, startOfMonthUTC, endOfMonthUTC, res);
        }
        // If no valid date filter is provided, return all transactions for the user
        const allTransactions = yield client_1.default.transaction.groupBy({
            by: ['logType'],
            where: { userId },
            _sum: {
                amount: true,
            },
        });
        const totalCredit = ((_b = allTransactions.find(t => t.logType === 'CREDIT')) === null || _b === void 0 ? void 0 : _b._sum.amount) || 0;
        const totalDebit = ((_c = allTransactions.find(t => t.logType === 'DEBIT')) === null || _c === void 0 ? void 0 : _c._sum.amount) || 0;
        return res.status(200).json({
            totalCredit,
            totalDebit,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating totals', error });
    }
});
exports.getTotalCreditAndDebit = getTotalCreditAndDebit;
const getUserBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Get userId from token or request
        // Fetch the user balances and due from the database
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
            select: {
                boxBalance: true,
                accountBalance: true,
                due: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Calculate total balance (boxBalance + accountBalance)
        const totalBalance = user.boxBalance.add(user.accountBalance);
        // Return the balances
        return res.status(200).json({
            boxBalance: user.boxBalance.toString(), // Convert to string if using Decimal
            accountBalance: user.accountBalance.toString(), // Convert to string if using Decimal
            totalBalance: totalBalance.toString(), // Convert to string if using Decimal
            due: user.due.toString(), // Convert to string if using Decimal
        });
    }
    catch (error) {
        console.error("Error fetching user balance:", error);
        res.status(500).json({ message: "Error fetching user balance", error });
    }
});
exports.getUserBalance = getUserBalance;
