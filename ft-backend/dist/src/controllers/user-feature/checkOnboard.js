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
exports.checkOnboard = void 0;
const client_1 = __importDefault(require("../../../prisma/client"));
const checkOnboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        // Fetch the user by ID
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
            include: {
                ownerPassword: true,
                companyShareDetails: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Check if required fields are filled
        const isBoxBalanceFilled = user.boxBalance.toNumber() > 0; // Convert Decimal to number
        const isAccountBalanceFilled = user.accountBalance.toNumber() > 0; // Convert Decimal to number
        const isCompanyShareDetailsFilled = !!user.companyShareDetails; // Checks if not null
        const isOwnerPasswordFilled = !!user.ownerPassword; // Checks if not null
        // Determine if all fields are filled
        const allFieldsFilled = isBoxBalanceFilled &&
            isAccountBalanceFilled &&
            isCompanyShareDetailsFilled &&
            isOwnerPasswordFilled;
        // Response
        return res.status(200).json({
            message: allFieldsFilled
                ? "All required fields are filled."
                : "Some required fields are missing.",
            details: {
                boxBalance: isBoxBalanceFilled,
                accountBalance: isAccountBalanceFilled,
                companyShareDetails: isCompanyShareDetailsFilled,
                ownerPassword: isOwnerPasswordFilled,
            },
        });
    }
    catch (error) {
        console.error("Error checking user fields:", error);
        res.status(500).json({ message: "Error checking user fields", error });
    }
});
exports.checkOnboard = checkOnboard;
