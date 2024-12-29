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
exports.setOwnerPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = __importDefault(require("../../../../prisma/client"));
const setOwnerPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Access the userId from the request user object (decoded JWT)
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        const { ownerPassword } = req.body;
        if (!ownerPassword) {
            return res.status(400).json({ message: 'Owner password is required' });
        }
        // Check if the user exists
        const user = yield client_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(ownerPassword, 10);
        // Create or update the owner password record for the user
        yield client_1.default.ownerPassword.upsert({
            where: { userId },
            update: { password: hashedPassword },
            create: {
                userId,
                password: hashedPassword
            }
        });
        res.status(200).json({ message: 'Owner password set successfully!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error setting owner password', error });
    }
});
exports.setOwnerPassword = setOwnerPassword;
