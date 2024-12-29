"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyUser = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Extract token from the authorization header
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "user") {
            return res.status(403).json({ message: "Access denied. User role required" });
        }
        req.user = { id: decoded.id, role: decoded.role }; // Attach both user ID and role to the request object
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.verifyUser = verifyUser;
