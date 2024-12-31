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
const zod_1 = require("zod");
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
        const resetLink = `${process.env.FRONTEND_URL}?token=${resetToken}`;
        yield (0, email_1.sendEmail)(user.email, "Password Reset Request", `Click this link to reset your password: ${resetLink}`);
        res.status(200).json({ message: "Password reset link sent to your email" });
    }
    catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Error processing password reset request" });
    }
});
exports.forgotPassword = forgotPassword;
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Reset token is required"),
    newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters long")
});
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get token from either query parameters or URL parameters
        const token = req.query.token || req.params.token;
        const { newPassword } = req.body;
        // Validate input
        const result = resetPasswordSchema.safeParse({
            token,
            newPassword
        });
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input",
                errors: result.error.errors
            });
        }
        const validatedData = result.data;
        // Hash the provided token to match the stored hash
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(validatedData.token)
            .digest("hex");
        // Find the user with the reset token and ensure it's not expired
        const user = yield client_1.default.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gte: new Date(),
                    not: null // Ensure resetTokenExpiry exists
                },
            },
        });
        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired password reset token"
            });
        }
        // Prevent reuse of the same password
        const isSamePassword = yield bcrypt_1.default.compare(validatedData.newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                message: "New password must be different from the current password"
            });
        }
        // Hash the new password with a cost factor of 12
        const hashedPassword = yield bcrypt_1.default.hash(validatedData.newPassword, 12);
        // Update the user's password and clear the reset token in a transaction
        yield client_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null
                },
            });
        }));
        res.status(200).json({
            message: "Password has been reset successfully"
        });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            message: "An error occurred while resetting your password"
        });
    }
});
exports.resetPassword = resetPassword;
