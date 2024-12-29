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
exports.payLater = void 0;
const client_1 = __importDefault(require("../../../prisma/client"));
const library_1 = require("@prisma/client/runtime/library");
const payLater = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const { paymentType, operatorAmount, agentAmount, modeOfPayment, transactionNumber } = req.body;
        const { transactionId } = req.params;
        // Validate transactionId
        if (!transactionId) {
            return res.status(400).json({ message: "Transaction ID is required." });
        }
        // Validate paymentType
        if (!["FULL", "PARTIAL"].includes(paymentType)) {
            return res.status(400).json({ message: "Invalid payment type. Must be FULL or PARTIAL." });
        }
        // Validate modeOfPayment
        if (!["CASH", "UPI"].includes(modeOfPayment)) {
            return res.status(400).json({ message: "Invalid mode of payment. Must be CASH or UPI." });
        }
        // For UPI, ensure transactionNumber is provided
        if (modeOfPayment === "UPI" && !transactionNumber) {
            return res.status(400).json({ message: "Transaction number is required for UPI payments." });
        }
        // Find the transaction
        const transaction = yield client_1.default.transaction.findUnique({
            where: { id: Number(transactionId) },
            include: { collection: true, commission: true },
        });
        if (!transaction || transaction.userId !== userId) {
            return res.status(404).json({ message: "Transaction not found or unauthorized." });
        }
        // Retrieve the user
        const user = yield client_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        let totalPayment = new library_1.Decimal(0);
        // Handle Partial Payment
        if (paymentType === "PARTIAL") {
            if (operatorAmount == null || agentAmount == null) {
                return res.status(400).json({ message: "Operator and agent amounts are required for partial payment." });
            }
            // Ensure operatorAmount and agentAmount don't exceed their respective dues
            const operatorDue = new library_1.Decimal(((_b = transaction.collection) === null || _b === void 0 ? void 0 : _b.remainingDue) || 0);
            const agentDue = new library_1.Decimal(((_c = transaction.commission) === null || _c === void 0 ? void 0 : _c.remainingDue) || 0);
            // Check if the amounts are greater than their respective dues
            if (operatorAmount > operatorDue) {
                return res.status(400).json({
                    message: `Operator payment amount exceeds the remaining due of ${operatorDue.toString()}.`,
                });
            }
            if (agentAmount > agentDue) {
                return res.status(400).json({
                    message: `Agent payment amount exceeds the remaining due of ${agentDue.toString()}.`,
                });
            }
            // Cap the payments to the due amounts for each
            const validOperatorAmount = new library_1.Decimal(operatorAmount).greaterThan(operatorDue) ? operatorDue : new library_1.Decimal(operatorAmount);
            const validAgentAmount = new library_1.Decimal(agentAmount).greaterThan(agentDue) ? agentDue : new library_1.Decimal(agentAmount);
            totalPayment = validOperatorAmount.add(validAgentAmount);
            // Check if the total payment exceeds the total due
            if (totalPayment.greaterThan(transaction.dueAmount || 0)) {
                return res.status(400).json({ message: "Total payment exceeds the due amount." });
            }
            // Update dueAmount in the transaction
            const updatedDueAmount = new library_1.Decimal(transaction.dueAmount || 0).sub(totalPayment);
            yield client_1.default.transaction.update({
                where: { id: Number(transactionId) },
                data: {
                    dueAmount: updatedDueAmount,
                    paymentType: "PARTIAL",
                },
            });
            // Update the remaining due for both commission and collection
            if (transaction.commission) {
                const updatedCommissionRemainingDue = new library_1.Decimal(transaction.commission.remainingDue).sub(validAgentAmount);
                yield client_1.default.commission.update({
                    where: { id: transaction.commission.id },
                    data: {
                        remainingDue: updatedCommissionRemainingDue,
                    },
                });
            }
            if (transaction.collection) {
                const updatedCollectionRemainingDue = new library_1.Decimal(transaction.collection.remainingDue).sub(validOperatorAmount);
                yield client_1.default.collection.update({
                    where: { id: transaction.collection.id },
                    data: {
                        remainingDue: updatedCollectionRemainingDue,
                    },
                });
            }
            // Deduct from the appropriate balance based on mode of payment
            let updatedBoxBalance = user.boxBalance;
            let updatedAccountBalance = user.accountBalance;
            if (modeOfPayment === "CASH") {
                updatedBoxBalance = new library_1.Decimal(user.boxBalance).sub(totalPayment);
            }
            else if (modeOfPayment === "UPI") {
                updatedAccountBalance = new library_1.Decimal(user.accountBalance).sub(totalPayment);
            }
            // Update the User's due balance and the selected balance
            const updatedUserDue = new library_1.Decimal(user.due).sub(totalPayment);
            yield client_1.default.user.update({
                where: { id: userId },
                data: {
                    due: updatedUserDue,
                    boxBalance: updatedBoxBalance,
                    accountBalance: updatedAccountBalance,
                },
            });
            // Create a debit log for the payment
            yield client_1.default.transaction.create({
                data: {
                    userId,
                    logType: "DEBIT",
                    desc: `PayLater ${paymentType} payment`,
                    amount: totalPayment,
                    modeOfPayment,
                    transactionNo: transactionNumber,
                    categoryId: transaction.categoryId, // Use the categoryId from the original transaction
                    remarks: `Partial payment of operator/agent`,
                },
            });
            return res.status(200).json({
                message: "Partial payment recorded successfully.",
                remainingDue: updatedDueAmount,
            });
        }
        // Handle Full Payment
        if (paymentType === "FULL") {
            totalPayment = new library_1.Decimal(transaction.dueAmount || 0);
            // Update the transaction's due amount to 0
            yield client_1.default.transaction.update({
                where: { id: Number(transactionId) },
                data: {
                    dueAmount: new library_1.Decimal(0),
                    paymentType: "FULL",
                },
            });
            // Update remaining due for both commission and collection to 0
            if (transaction.commission) {
                yield client_1.default.commission.update({
                    where: { id: transaction.commission.id },
                    data: {
                        remainingDue: new library_1.Decimal(0),
                    },
                });
            }
            if (transaction.collection) {
                yield client_1.default.collection.update({
                    where: { id: transaction.collection.id },
                    data: {
                        remainingDue: new library_1.Decimal(0),
                    },
                });
            }
            // Deduct from the appropriate balance based on mode of payment
            let updatedBoxBalance = user.boxBalance;
            let updatedAccountBalance = user.accountBalance;
            if (modeOfPayment === "CASH") {
                updatedBoxBalance = new library_1.Decimal(user.boxBalance).sub(totalPayment);
            }
            else if (modeOfPayment === "UPI") {
                updatedAccountBalance = new library_1.Decimal(user.accountBalance).sub(totalPayment);
            }
            // Update the User's due balance and the selected balance
            const updatedUserDue = new library_1.Decimal(user.due).sub(totalPayment);
            yield client_1.default.user.update({
                where: { id: userId },
                data: {
                    due: updatedUserDue,
                    boxBalance: updatedBoxBalance,
                    accountBalance: updatedAccountBalance,
                },
            });
            // Create a debit log for the full payment
            yield client_1.default.transaction.create({
                data: {
                    userId,
                    logType: "DEBIT",
                    desc: "PayLater FULL payment",
                    amount: totalPayment,
                    modeOfPayment,
                    transactionNo: transactionNumber,
                    categoryId: transaction.categoryId, // Use the categoryId from the original transaction
                    remarks: "Full payment of outstanding due",
                },
            });
            return res.status(200).json({
                message: "Full payment recorded successfully.",
            });
        }
    }
    catch (error) {
        console.error("Error processing payLater:", error);
        res.status(500).json({ message: "An error occurred while processing the payment.", error });
    }
});
exports.payLater = payLater;
