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
exports.checkOwner = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = __importDefault(require("../../prisma/client"));
const checkOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { password } = req.body; // Get the password from the query string
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the user ID from the verified token
        // Validate required inputs
        if (!password) {
            res.status(400).json({ message: 'Password is required' });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: 'User ID not found in the token' });
            return;
        }
        // Fetch the owner password from the database
        const ownerPasswordRecord = yield client_1.default.ownerPassword.findUnique({
            where: { userId },
        });
        if (!ownerPasswordRecord) {
            res.status(404).json({ message: 'Owner password not set for this user' });
            return;
        }
        // Compare the provided password with the stored hashed password
        const isValidPassword = yield bcrypt_1.default.compare(password, ownerPasswordRecord.password);
        if (!isValidPassword) {
            res.status(403).json({ message: 'Invalid owner password' });
            return;
        }
        // If password is valid, proceed to the next middleware or route
        next();
    }
    catch (error) {
        console.error('Error in checkOwnerPassword middleware:', error);
        res.status(500).json({ message: 'Error checking password' });
    }
});
exports.checkOwner = checkOwner;
