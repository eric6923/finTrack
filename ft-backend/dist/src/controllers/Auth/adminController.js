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
exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = __importDefault(require("../../../prisma/client"));
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const admin = yield client_1.default.admin.findUnique({ where: { email } });
        if (!admin)
            return res.status(400).json({ message: "Invalid email or password" });
        const isPasswordValid = yield bcrypt_1.default.compare(password, admin.password);
        if (!isPasswordValid)
            return res.status(400).json({ message: "Invalid email or password" });
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: process.env.EXPIRES_IN,
        });
        res.status(200).json({ message: "Admin login successful", token });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
});
exports.adminLogin = adminLogin;
