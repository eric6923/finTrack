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
exports.userLogin = exports.userRegister = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = __importDefault(require("../../../prisma/client"));
const client_2 = require("@prisma/client");
const userRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, email, userName, password, phone, address, gstin, aadhar, pan } = req.body;
    try {
        // Check if user already exists in pendingUser or AllRequest
        const existingUserInPending = yield client_1.default.pendingUser.findUnique({ where: { email } });
        if (existingUserInPending) {
            return res.status(400).json({ message: "Email already exists in pending requests" });
        }
        const existingUserInAllRequest = yield client_1.default.allRequest.findUnique({ where: { email } });
        if (existingUserInAllRequest) {
            return res.status(400).json({ message: "Email already exists in all requests" });
        }
        const existingUserByUsername = yield client_1.default.pendingUser.findUnique({ where: { userName } });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Username already exists in pending requests" });
        }
        const existingUserByAadhar = yield client_1.default.pendingUser.findUnique({ where: { aadhar: aadhar.toString() } });
        if (existingUserByAadhar) {
            return res.status(400).json({ message: "Aadhar number already registered in pending requests" });
        }
        const existingUserByPan = yield client_1.default.pendingUser.findUnique({ where: { pan: pan.toString() } });
        if (existingUserByPan) {
            return res.status(400).json({ message: "PAN number already registered in pending requests" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Insert into both PendingUser and AllRequest tables
        const newUser = yield client_1.default.pendingUser.create({
            data: {
                name,
                email,
                userName,
                password: hashedPassword,
                phone,
                address,
                gstin,
                aadhar,
                pan
            },
        });
        yield client_1.default.allRequest.create({
            data: {
                name,
                email,
                userName,
                password: hashedPassword,
                phone,
                address,
                gstin,
                aadhar,
                pan
            },
        });
        // Remove sensitive information before sending response
        const { password: removedPassword } = newUser, userResponse = __rest(newUser, ["password"]);
        res.status(201).json({
            message: "User registered successfully",
            user: userResponse
        });
    }
    catch (error) {
        // Handle Prisma unique constraint violations
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            // Unique constraint error
            if (error.code === 'P2002') {
                const targetField = (_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b[0];
                return res.status(400).json({
                    message: `${targetField ? targetField.charAt(0).toUpperCase() + targetField.slice(1) : 'Field'} must be unique`
                });
            }
        }
        // Log the error for server-side debugging
        console.error('Registration error:', error);
        res.status(500).json({
            message: "Error registering user",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.userRegister = userRegister;
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, password } = req.body;
    try {
        const user = yield client_1.default.user.findUnique({ where: { userName } });
        if (!user)
            return res.status(400).json({ message: "Invalid username or password" });
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({ message: "Invalid username or password" });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: "user",
            userName: user.userName
        }, process.env.JWT_SECRET, {
            expiresIn: process.env.EXPIRES_IN,
        });
        res.status(200).json({
            message: "User login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                userName: user.userName
            }
        });
    }
    catch (error) {
        // Log the error for server-side debugging
        console.error('Login error:', error);
        res.status(500).json({
            message: "Error logging in",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.userLogin = userLogin;
