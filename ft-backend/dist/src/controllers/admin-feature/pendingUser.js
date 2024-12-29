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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaymentAndApproveUser = exports.submitPaymentVerification = exports.rejectPendingUser = exports.getAllUsers = exports.getAllPendingUsers = void 0;
const client_1 = __importDefault(require("../../../prisma/client"));
const getAllPendingUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingUsers = yield client_1.default.pendingUser.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                userName: true,
                aadhar: true,
                pan: true,
                gstin: true,
                address: true,
                phone: true,
                createdAt: true
            }
        });
        res.status(200).json({
            message: "Pending users retrieved successfully",
            pendingUsers
        });
    }
    catch (error) {
        console.error('Retrieve pending users error:', error);
        res.status(500).json({
            message: "Error retrieving pending users",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
    ;
});
exports.getAllPendingUsers = getAllPendingUsers;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Users = yield client_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                userName: true,
                aadhar: true,
                pan: true,
                gstin: true,
                address: true,
                phone: true,
                createdAt: true
            }
        });
        res.status(200).json({
            message: " users retrieved successfully",
            Users
        });
    }
    catch (error) {
        console.error('Retrieve  users error:', error);
        res.status(500).json({
            message: "Error retrieving  users",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
    ;
});
exports.getAllUsers = getAllUsers;
const rejectPendingUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pendingUserId } = req.params;
    try {
        yield client_1.default.pendingUser.delete({
            where: { id: parseInt(pendingUserId) }
        });
        res.status(200).json({
            message: "Pending user registration rejected and deleted"
        });
    }
    catch (error) {
        console.error('Reject pending user error:', error);
        res.status(500).json({
            message: "Error rejecting pending user",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
    ;
});
exports.rejectPendingUser = rejectPendingUser;
const submitPaymentVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, paymentMethod, upiTransactionId } = req.body;
    const { pendingUserId } = req.params;
    // Validate input
    if (!pendingUserId) {
        return res.status(400).json({ message: "Pending User ID is required" });
    }
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
    }
    if (paymentMethod === 'UPI' && !upiTransactionId) {
        return res.status(400).json({ message: "UPI Transaction ID is required for UPI payments" });
    }
    try {
        // Check if pending user exists
        const pendingUser = yield client_1.default.pendingUser.findUnique({
            where: { id: parseInt(pendingUserId) }
        });
        if (!pendingUser) {
            return res.status(404).json({ message: "Pending user not found" });
        }
        // Check if payment verification already exists
        const existingPaymentVerification = yield client_1.default.paymentVerification.findUnique({
            where: { pendingUserId: parseInt(pendingUserId) }
        });
        if (existingPaymentVerification) {
            // Update existing payment verification
            const updatedPaymentVerification = yield client_1.default.paymentVerification.update({
                where: { pendingUserId: parseInt(pendingUserId) },
                data: {
                    amount: parseFloat(amount.toString()),
                    paymentMethod,
                    upiTransactionId: paymentMethod === 'UPI' ? upiTransactionId : null,
                    isVerified: true, // Automatically set to verified
                }
            });
            return res.status(200).json({
                message: "Payment verification updated",
                paymentVerification: updatedPaymentVerification
            });
        }
        // Create new payment verification
        const paymentVerification = yield client_1.default.paymentVerification.create({
            data: {
                pendingUserId: parseInt(pendingUserId),
                amount: parseFloat(amount.toString()),
                paymentMethod,
                upiTransactionId: paymentMethod === 'UPI' ? upiTransactionId : null,
                isVerified: true, // Automatically set to verified
            }
        });
        res.status(201).json({
            message: "Payment verification submitted",
            paymentVerification
        });
    }
    catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            message: "Error submitting payment verification",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.submitPaymentVerification = submitPaymentVerification;
// Approve User
const verifyPaymentAndApproveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pendingUserId } = req.params;
    try {
        const pendingUserIdInt = parseInt(pendingUserId);
        // Validate the pending user ID
        if (isNaN(pendingUserIdInt)) {
            return res.status(400).json({ message: "Invalid Pending User ID" });
        }
        // Check if the pending user exists
        const pendingUser = yield client_1.default.pendingUser.findUnique({
            where: { id: pendingUserIdInt },
        });
        if (!pendingUser) {
            return res.status(404).json({ message: "Pending user not found" });
        }
        // Check if payment verification exists
        const paymentVerification = yield client_1.default.paymentVerification.findUnique({
            where: { pendingUserId: pendingUserIdInt },
        });
        if (!paymentVerification) {
            return res.status(404).json({
                message: "Payment verification record not found for this pending user",
                debug: { pendingUserIdInt }
            });
        }
        // Begin transaction
        const approvedUser = yield client_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Create user in the main user table
            const newUser = yield prisma.user.create({
                data: {
                    name: pendingUser.name,
                    email: pendingUser.email,
                    userName: pendingUser.userName,
                    password: pendingUser.password,
                    phone: pendingUser.phone,
                    gstin: pendingUser.gstin,
                    aadhar: pendingUser.aadhar,
                    pan: pendingUser.pan,
                },
            });
            // Delete the pending user record
            yield prisma.pendingUser.delete({
                where: { id: pendingUserIdInt },
            });
            // Delete the payment verification record
            // await prisma.paymentVerification.delete({
            //   where: { pendingUserId: pendingUserIdInt }, // Key match explicitly here
            // });
            return newUser;
        }));
        // Remove sensitive data before response
        const { password } = approvedUser, userResponse = __rest(approvedUser, ["password"]);
        res.status(200).json({
            message: "User approved and activated successfully",
            user: userResponse,
        });
    }
    catch (error) {
        // Handle Prisma errors gracefully
        //   if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        //     return res.status(404).json({
        //       message: "Record not found during delete operation",
        //       debug: { pendingUserId },
        //     });
        //   }
        // Catch-all for other errors
        console.error("User approval error:", error);
        res.status(500).json({
            message: "Error approving user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.verifyPaymentAndApproveUser = verifyPaymentAndApproveUser;
