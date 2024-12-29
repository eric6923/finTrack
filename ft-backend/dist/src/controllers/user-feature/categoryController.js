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
exports.getCategoriesByUser = exports.createCategory = void 0;
const client_1 = __importDefault(require("../../../prisma/client"));
// Create a new category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { name } = req.body;
    try {
        // Ensure userId is available and is a number
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? Number(req.user.id) : null;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        // Convert the category name to uppercase
        name = name.toUpperCase();
        // Check if the category already exists for this user by name and createdBy
        const existingCategory = yield client_1.default.category.findFirst({
            where: {
                name: name,
                createdBy: userId, // Ensure the category is unique to the user
            },
        });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists for this user" });
        }
        // Create the category with the userId as the createdBy field
        const category = yield client_1.default.category.create({
            data: {
                name,
                createdBy: userId, // Store the userId of the user who created the category
            },
        });
        res.status(201).json(category); // Return the created category
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating category" });
    }
});
exports.createCategory = createCategory;
// Get categories by user
const getCategoriesByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? Number(req.user.id) : null;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const categories = yield client_1.default.category.findMany({
            where: { createdBy: userId }, // Use the userId from the token
        });
        res.status(200).json(categories); // Return all categories created by the user
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching categories" });
    }
});
exports.getCategoriesByUser = getCategoriesByUser;
