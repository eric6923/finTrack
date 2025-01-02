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
        // Fetch CREDIT transactions
        const creditTransactions = yield prisma.transaction.findMany({
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
        // Fetch DEBIT transactions, excluding "BUS BOOKING" category
        const debitTransactions = yield prisma.transaction.findMany({
            where: {
                userId,
                logType: 'DEBIT',
                category: {
                    NOT: {
                        name: 'BUS BOOKING', // Assuming "name" is the field for category name
                    },
                },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        // Calculate total CREDIT profit
        const totalCreditProfit = creditTransactions.reduce((sum, transaction) => {
            var _a, _b;
            const agentAmount = ((_a = transaction.commission) === null || _a === void 0 ? void 0 : _a.amount.toNumber()) || 0;
            const operatorAmount = ((_b = transaction.collection) === null || _b === void 0 ? void 0 : _b.amount.toNumber()) || 0;
            const profit = transaction.amount.toNumber() - (agentAmount + operatorAmount);
            return sum + profit;
        }, 0);
        // Calculate total DEBIT amount (excluding "BUS BOOKING")
        const totalDebitAmount = debitTransactions.reduce((sum, transaction) => sum + transaction.amount.toNumber(), 0);
        // Final adjusted profit
        return totalCreditProfit - totalDebitAmount;
    }
    catch (error) {
        console.error('Error calculating monthly profit:', error);
        return 0; // Default to 0 if an error occurs
    }
});
exports.getTotalProfitByMonth = getTotalProfitByMonth;
// Fixed version of calculateShareDistribution function
const calculateShareDistribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        // Fetch company share details
        const companyShares = yield prisma.companyShareDetails.findUnique({
            where: { userId },
            include: { shareholders: true },
        });
        if (!companyShares || !companyShares.shareholders.length) {
            return res.status(400).json({ error: 'Company share details not found or no shareholders available.' });
        }
        const { date } = req.query;
        // Validate date format (YYYY-MM)
        if (!date || typeof date !== 'string' || date.length !== 7) {
            return res.status(400).json({ error: 'Provide a valid date in YYYY-MM format.' });
        }
        // Prepare date range
        const startOfMonthDate = (0, date_fns_1.parseISO)(`${date}-01`);
        const endOfMonthDate = new Date(startOfMonthDate);
        endOfMonthDate.setMonth(startOfMonthDate.getMonth() + 1);
        // Fetch total profit for the month
        const totalProfit = yield (0, exports.getTotalProfitByMonth)(userId, startOfMonthDate.toISOString(), endOfMonthDate.toISOString());
        if (totalProfit === 0) {
            return res.status(200).json({
                message: 'No profit generated for the given month.',
                totalProfit,
                shareDistribution: [],
            });
        }
        // Distribute profit among shareholders
        const shareDistribution = yield Promise.all(companyShares.shareholders.map((shareholder) => __awaiter(void 0, void 0, void 0, function* () {
            const shareholderProfit = new library_1.Decimal((totalProfit * shareholder.sharePercentage) / 100);
            const financeValue = shareholder.finance || new library_1.Decimal(0);
            const finalProfit = shareholderProfit.minus(financeValue);
            // Update the shareholder's profit in the database
            yield prisma.shareholder.update({
                where: { id: shareholder.id },
                data: {
                    shareProfit: shareholder.shareProfit.plus(finalProfit),
                },
            });
            return {
                shareholder: shareholder.name,
                percentage: shareholder.sharePercentage,
                originalProfit: shareholderProfit.toNumber(),
                financeDeducted: financeValue.toNumber(),
                finalProfit: finalProfit.toNumber(),
            };
        })));
        // Return response
        res.status(200).json({
            month: date,
            totalProfit,
            shareDistribution,
        });
    }
    catch (error) {
        console.error('Share Distribution Error:', error);
        res.status(500).json({ error: 'Failed to calculate share distribution.' });
    }
});
exports.calculateShareDistribution = calculateShareDistribution;
