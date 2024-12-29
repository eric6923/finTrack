"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRole = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyRole = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        req.user = decoded; // Attach decoded data to the request object
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.verifyRole = verifyRole;
