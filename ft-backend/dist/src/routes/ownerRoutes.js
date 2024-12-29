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
const controlPanelController_1 = require("../controllers/user-feature/controlPanelController");
const sharesController_1 = require("../controllers/sharesController");
const sharesController_2 = require("../controllers/sharesController");
const checkOnboard_1 = require("../controllers/user-feature/checkOnboard");
const userMiddleware_1 = require("../middleware/userMiddleware");
const router = express_1.default.Router();
router.post("/verify-password", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.verifyControlPanelPassword)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error during verification process." });
    }
}));
router.post("/bus", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.createBus)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error during registering Bus." });
    }
}));
router.post("/agent", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.createAgent)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error during registering agent." });
    }
}));
router.post("/operator", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.createOperator)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error during registering BusOperator." });
    }
}));
router.post("/balance", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.setOpeningBalance)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error setting  balance." });
    }
}));
//shares
router.post("/shares", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, sharesController_2.createCompanyShares)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error creating shares." });
    }
}));
router.get("/shares", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, sharesController_1.calculateShareDistribution)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching shares." });
    }
}));
router.delete("/bus/:id", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.deleteBus)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting BUS." });
    }
}));
router.delete("/agent/:id", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.deleteAgent)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting agent." });
    }
}));
router.delete("/operator/:id", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, controlPanelController_1.deleteOperator)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting operator." });
    }
}));
router.get("/check-onboard", userMiddleware_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, checkOnboard_1.checkOnboard)(req, res); // Ensure this is awaited
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching details." });
    }
}));
exports.default = router;
