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
exports.resetPassword = exports.forgotPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../../utils/email"); // Utility function for sending emails
const client_1 = __importDefault(require("../../../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield client_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate a secure reset token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
        // Set the token and expiry in the database
        yield client_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
            },
        });
        // Send the reset link via email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        yield (0, email_1.sendEmail)(user.email, "Password Reset Request", `Click this link to reset your password: ${resetLink}`);
        res.status(200).json({ message: "Password reset link sent to your email" });
    }
    catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Error processing password reset request" });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        // Hash the provided token to match the stored hash
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        // Find the user with the reset token and ensure it's not expired
        const user = yield client_1.default.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: { gte: new Date() }, // Token not expired
            },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the user's password and clear the reset token
        yield client_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
});
exports.resetPassword = resetPassword;
