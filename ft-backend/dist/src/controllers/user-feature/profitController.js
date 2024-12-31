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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProfitByDateRange = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
const calculateProfitByDateRange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const { date, startDate, endDate } = req.query;
        let startDateParsed;
        let endDateParsed;
        // Date parsing logic (same as before)
        if (!date && !startDate && !endDate) {
            startDateParsed = new Date(0);
            endDateParsed = new Date();
        }
        else if (date) {
            if (date.length === 10) {
                startDateParsed = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(date));
                endDateParsed = (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(date));
            }
            else if (date.length === 7) {
                startDateParsed = (0, date_fns_1.startOfMonth)((0, date_fns_1.parseISO)(date + '-01'));
                endDateParsed = (0, date_fns_1.endOfMonth)((0, date_fns_1.parseISO)(date + '-01'));
            }
            else {
                return res.status(400).json({ error: 'Invalid date format' });
            }
        }
        else if (startDate && endDate) {
            startDateParsed = (0, date_fns_1.parseISO)(startDate);
            endDateParsed = (0, date_fns_1.parseISO)(endDate);
            if (!(0, date_fns_1.isValid)(startDateParsed) || !(0, date_fns_1.isValid)(endDateParsed)) {
                return res.status(400).json({ error: 'Invalid date range' });
            }
        }
        else {
            return res.status(400).json({ error: 'Please provide a valid date or date range' });
        }
        // Fetch CREDIT transactions
        const creditTransactions = yield prisma.transaction.findMany({
            where: {
                userId,
                logType: 'CREDIT',
                OR: [
                    { payLater: false },
                    { payLater: true, dueAmount: 0 },
                ],
                createdAt: {
                    gte: startDateParsed,
                    lte: endDateParsed,
                },
            },
            include: {
                commission: true,
                collection: true,
            },
        });
        // Fetch DEBIT transactions
        const debitTransactions = yield prisma.transaction.findMany({
            where: {
                userId,
                logType: 'DEBIT',
                createdAt: {
                    gte: startDateParsed,
                    lte: endDateParsed,
                },
            },
        });
        // Calculate profit for CREDIT transactions
        const creditProfits = creditTransactions.map((transaction) => {
            var _a, _b;
            const agentAmount = ((_a = transaction.commission) === null || _a === void 0 ? void 0 : _a.amount.toNumber()) || 0;
            const operatorAmount = ((_b = transaction.collection) === null || _b === void 0 ? void 0 : _b.amount.toNumber()) || 0;
            const profit = transaction.amount.toNumber() - (agentAmount + operatorAmount);
            return {
                transactionId: transaction.id,
                amount: transaction.amount.toNumber(),
                agentAmount,
                operatorAmount,
                profit,
            };
        });
        // Calculate total CREDIT profit
        const totalCreditProfit = creditProfits.reduce((sum, tx) => sum + tx.profit, 0);
        // Calculate total DEBIT amount
        const totalDebitAmount = debitTransactions.reduce((sum, tx) => sum + tx.amount.toNumber(), 0);
        // Adjust profit by subtracting DEBIT amount
        const adjustedProfit = totalCreditProfit - totalDebitAmount;
        // Respond with data
        res.status(200).json({
            transactions: creditProfits,
            totalCreditProfit,
            totalDebitAmount,
            adjustedProfit,
        });
    }
    catch (error) {
        console.error('Error calculating profit:', error);
        res.status(500).json({ error: 'Failed to calculate profit' });
    }
});
exports.calculateProfitByDateRange = calculateProfitByDateRange;
