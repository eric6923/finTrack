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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateShareDistribution = exports.getTotalProfitByMonth = exports.generateFinanceCategories = exports.createCompanyShares = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
// Controller for creating company shares
const createCompanyShares = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { businessName, businessCategory, businessType, numberOfShareHolders, shareholders, // This is an array of shareholder objects (name and share percentage)
     } = req.body;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        // If the businessType is 'sole proprietorship' or 'OPC', skip numberOfShareHolders
        if ((businessType === 'Sole Proprietorship' || businessType === 'OPC') && numberOfShareHolders > 0) {
            return res.status(400).json({
                error: 'No shareholders required for Sole Proprietorship or OPC business type',
            });
        }
        // Check if the number of shareholders matches the number of shareholder data provided
        if (shareholders.length !== numberOfShareHolders) {
            return res.status(400).json({
                error: `Expected ${numberOfShareHolders} shareholders, but got ${shareholders.length}`,
            });
        }
        // Create company share details and shareholders
        const companyShareDetails = yield prisma.companyShareDetails.create({
            data: {
                businessName,
                businessCategory,
                businessType,
                numberOfShareHolders,
                user: { connect: { id: userId } }, // Connect company share details to user
                shareholders: {
                    create: shareholders.map((shareholder) => ({
                        name: shareholder.name,
                        sharePercentage: shareholder.sharePercentage,
                    })),
                },
            },
        });
        // Automatically generate finance categories for shareholders
        yield (0, exports.generateFinanceCategories)(userId, shareholders);
        return res.status(201).json({
            message: 'Company shares created successfully!',
            data: companyShareDetails,
        });
    }
    catch (error) {
        console.error('Error creating company shares:', error);
        return res.status(500).json({
            error: 'Failed to create company shares',
        });
    }
});
exports.createCompanyShares = createCompanyShares;
// Controller for handling finance category transactions
// export const recordShareholderTransaction = async (req: CustomRequest, res: Response) => {
//   const { shareholderName, transactionType, amount, categoryId } = req.body;
//   try {
//     const userId = Number(req.user?.id);
//     // Fetch the shareholder's current share amount
//     const shareholder = await prisma.shareholder.findFirst({
//       where: {
//         userId,
//         name: shareholderName,
//       },
//     });
//     if (!shareholder) {
//       return res.status(400).json({ error: 'Shareholder not found' });
//     }
//     // Fetch the associated category for the shareholder finance
//     const category = await prisma.category.findFirst({
//       where: {
//         createdBy: userId,
//         name: `${shareholderName} Finance`.toUpperCase(),
//       },
//     });
//     if (!category) {
//       return res.status(400).json({ error: 'Finance category not found' });
//     }
//     // Handle debit or credit transaction based on type
//     if (transactionType === 'DEBIT') {
//       if (shareholder.shareAmount < amount) {
//         return res.status(400).json({ error: 'Insufficient share amount for debit' });
//       }
//       // Deduct the amount from shareholder's share
//       await prisma.shareholder.update({
//         where: { id: shareholder.id },
//         data: {
//           shareAmount: shareholder.shareAmount - amount,
//         },
//       });
//     }
//     // Record the transaction under the finance category
//     await prisma.transaction.create({
//       data: {
//         amount,
//         categoryId,
//         transactionType,
//         shareholderId: shareholder.id,
//       },
//     });
//     return res.status(201).json({ message: 'Transaction recorded successfully' });
//   } catch (error) {
//     console.error('Error recording transaction:', error);
//     return res.status(500).json({
//       error: 'Failed to record transaction',
//     });
//   }
// };
// Helper function for generating finance categories based on shareholder names
const generateFinanceCategories = (userId, shareholders) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Map shareholder names to finance categories
        const financeCategories = shareholders.map((shareholder) => ({
            name: `${shareholder.name} Finance`.toUpperCase(),
            createdBy: userId,
        }));
        // Check for existing categories to avoid duplicates
        for (const category of financeCategories) {
            const existingCategory = yield prisma.category.findFirst({
                where: { name: category.name, createdBy: userId },
            });
            if (!existingCategory) {
                yield prisma.category.create({
                    data: category,
                });
            }
        }
    }
    catch (error) {
        console.error('Error generating finance categories:', error);
    }
});
exports.generateFinanceCategories = generateFinanceCategories;
const getTotalProfitByMonth = (userId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch transactions and calculate profit for the given date range
        const transactions = yield prisma.transaction.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                logType: 'CREDIT',
                OR: [
                    { payLater: false },
                    { payLater: true, dueAmount: 0 },
                ],
            },
            include: {
                commission: true,
                collection: true,
            },
        });
        const totalProfit = transactions.reduce((sum, transaction) => {
            var _a, _b;
            const agentAmount = ((_a = transaction.commission) === null || _a === void 0 ? void 0 : _a.amount.toNumber()) || 0;
            const operatorAmount = ((_b = transaction.collection) === null || _b === void 0 ? void 0 : _b.amount.toNumber()) || 0;
            const profit = transaction.amount.toNumber() - (agentAmount + operatorAmount);
            return sum + profit;
        }, 0);
        return totalProfit;
    }
    catch (error) {
        console.error('Error calculating monthly profit:', error);
        return 0; // Default to 0 if an error occurs
    }
});
exports.getTotalProfitByMonth = getTotalProfitByMonth;
const calculateShareDistribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        // Fetch the company share details for the user
        const companyShares = yield prisma.companyShareDetails.findUnique({
            where: { userId },
            include: { shareholders: true },
        });
        // Validate company shares exist
        if (!companyShares || !companyShares.shareholders) {
            return res.status(400).json({ error: 'Company share details not found' });
        }
        const { date } = req.query;
        // Validate date format
        if (!date || typeof date !== 'string' || date.length !== 7) {
            return res.status(400).json({ error: 'Provide date in YYYY-MM format' });
        }
        // Prepare date range for profit calculation
        const startOfMonth = (0, date_fns_1.parseISO)(`${date}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);
        // Fetch the total profit for the specified month
        const totalProfit = yield (0, exports.getTotalProfitByMonth)(userId, startOfMonth.toISOString(), endOfMonth.toISOString());
        // Distribute profit among shareholders and update their shareProfit
        const shareDistribution = yield Promise.all(companyShares.shareholders.map((shareholder) => __awaiter(void 0, void 0, void 0, function* () {
            const shareholderProfit = new library_1.Decimal((totalProfit * shareholder.sharePercentage) / 100); // Convert profit to Decimal
            // Calculate the final profit after deducting finance value
            const financeValue = shareholder.finance || new library_1.Decimal(0);
            const finalProfit = shareholderProfit.minus(financeValue);
            // Update the shareProfit field in the database
            yield prisma.shareholder.update({
                where: { id: shareholder.id },
                data: {
                    shareProfit: shareholder.shareProfit.plus(finalProfit), // Update with the remaining profit
                },
            });
            return {
                shareholder: shareholder.name,
                percentage: shareholder.sharePercentage,
                originalProfit: shareholderProfit.toNumber(), // Profit before finance deduction
                financeDeducted: financeValue.toNumber(), // Finance value deducted
                finalProfit: finalProfit.toNumber(), // Profit after finance deduction
            };
        })));
        // Return the distribution details
        res.status(200).json({
            month: date,
            totalProfit,
            shareDistribution,
        });
    }
    catch (error) {
        console.error('Share Distribution Error:', error);
        res.status(500).json({ error: 'Failed to calculate share distribution' });
    }
});
exports.calculateShareDistribution = calculateShareDistribution;
