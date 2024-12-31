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
exports.resetOwnerPassword = exports.forgotOwnerPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../../utils/email"); // Utility function for sending emails
const client_1 = __importDefault(require("../../../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const forgotOwnerPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        // Check if the user exists and has an associated OwnerPassword
        const user = yield client_1.default.user.findUnique({
            where: { email },
            include: { ownerPassword: true },
        });
        if (!user || !user.ownerPassword) {
            return res.status(404).json({ error: "Owner account not found" });
        }
        // Generate reset token and expiry
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // Token valid for 1 hour
        // Update the user with the reset token and expiry
        yield client_1.default.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        // Construct reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-owner-password?token=${resetToken}`;
        // Use the sendEmail utility
        yield (0, email_1.sendEmail)(email, "Reset Your Owner Password", `
        Hi ${user.name},
        
        You requested to reset your owner password. Click the link below to reset it:
        ${resetLink}
        
        If you didn’t request this, you can ignore this email.
        `);
        res.status(200).json({ message: "Password reset email sent" });
    }
    catch (error) {
        console.error("Error during forgot owner password:", error);
        res.status(500).json({ error: "Failed to send reset email" });
    }
});
exports.forgotOwnerPassword = forgotOwnerPassword;
const resetOwnerPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        // Find user by reset token
        const user = yield client_1.default.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gte: new Date(), // Ensure token is still valid
                },
            },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the OwnerPassword and clear the resetToken fields
        yield client_1.default.$transaction([
            client_1.default.ownerPassword.update({
                where: { userId: user.id },
                data: { password: hashedPassword },
            }),
            client_1.default.user.update({
                where: { id: user.id },
                data: {
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            }),
        ]);
        res.status(200).json({ message: "Owner password reset successfully" });
    }
    catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ error: "Failed to reset owner password" });
    }
});
exports.resetOwnerPassword = resetOwnerPassword;
