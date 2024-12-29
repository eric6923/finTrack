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
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/Auth/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const pendingUser_1 = require("../controllers/admin-feature/pendingUser");
const router = express_1.default.Router();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader('Access-Control-Allow-Origin', '*');
    yield (0, adminController_1.adminLogin)(req, res);
}));
router.get("/users", authMiddleware_1.verifyRole, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, pendingUser_1.getAllUsers)(req, res);
}));
router.get("/pending-request", authMiddleware_1.verifyRole, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, pendingUser_1.getAllPendingUsers)(req, res);
}));
router.post("/payment-verification/:pendingUserId", authMiddleware_1.verifyRole, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, pendingUser_1.submitPaymentVerification)(req, res);
}));
router.post("/approve/:pendingUserId", authMiddleware_1.verifyRole, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, pendingUser_1.verifyPaymentAndApproveUser)(req, res);
}));
router.delete('/reject/:pendingUserId', authMiddleware_1.verifyRole, pendingUser_1.rejectPendingUser);
exports.default = router;
