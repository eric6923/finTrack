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
exports.getFilteredTransactions = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getFilteredTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Assuming `verifyUser` middleware adds `user` to the request
        const { category, logType, modeOfPayment, payLater, operatorName, agentName, busName } = req.query;
        // Construct Prisma `where` clause dynamically
        const filters = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ userId }, (category && { category: { name: String(category) } })), (logType && { logType: String(logType) })), (modeOfPayment && { modeOfPayment: String(modeOfPayment) })), (payLater !== undefined && { payLater: payLater === 'true' })), (operatorName && { collection: { operator: { name: String(operatorName) } } })), (agentName && { commission: { agent: { name: String(agentName) } } })), (busName && { payLaterDetails: { bus: { name: String(busName) } } }));
        const transactions = yield prisma.transaction.findMany({
            where: filters,
            include: {
                category: true, // Include category details
                collection: {
                    include: { operator: true },
                },
                commission: {
                    include: { agent: true },
                },
                payLaterDetails: {
                    include: { bus: true },
                },
            },
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error("Error fetching filtered transactions:", error);
        res.status(500).json({ error: "Failed to fetch filtered transactions" });
    }
});
exports.getFilteredTransactions = getFilteredTransactions;
