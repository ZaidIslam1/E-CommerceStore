import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } }, // Sort by date ascending
        ]);

        const dateArray = getDatesInRange(startDate, endDate);

        return dateArray.map((date) => {
            const salesData = dailySalesData.find((data) => data._id === date);
            return {
                date,
                totalSales: salesData ? salesData.totalSales : 0,
                totalRevenue: salesData ? salesData.totalRevenue : 0,
            };
        });
    } catch (error) {
        console.error("Error in getDailySalesData", error.message);
        throw error;
    }
};

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

const getAnalyticsData = async () => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
        ]);

        const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue,
        };
    } catch (error) {
        console.error("Error in getAnalyticsData", error.message);
        throw error;
    }
};

export const getAnalytics = async (req, res, next) => {
    try {
        const analyticsData = await getAnalyticsData();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.status(200).json({
            analyticsData,
            dailySalesData,
        });
    } catch (error) {
        console.error("Error in getAnalytics", error.message);
        next(error);
    }
};
