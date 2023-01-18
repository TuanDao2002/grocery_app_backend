const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Order = require("../models/Order");
const User = require("../models/User");
const Item = require("../models/Item");
const Voucher = require("../models/Voucher");
const mongoose = require("mongoose");

const getAllOrders = async (req, res) => {
    let {
        query: { isFulfilled },
    } = req;

    const queryObject = {};
    queryObject.isAvailable = true;
    queryObject.isFulfilled = isFulfilled === "true" ? true : false;
    let orders = await Order.find(queryObject);
    res.status(StatusCodes.OK).json({ orders });
};

const createOrder = async (req, res) => {
    const {
        user: { userId },
        body: { orderItems, convertedPoints, voucherApplied },
    } = req;

    let user = await User.findOne({ _id: userId });
    if (!user) {
        throw new CustomError.BadRequestError("This user does not exist");
    }

    let subTotal = 0;
    if (orderItems.length <= 0) {
        throw new CustomError.BadRequestError("There is no item in this order");
    } else {
        for (let orderItem of orderItems) {
            const { item, quantity } = orderItem;
            const findItem = await Item.findOne({
                _id: mongoose.Types.ObjectId(item),
            });

            if (!findItem.isAvailable) {
                throw new CustomError.BadRequestError(
                    `Item ${findItem.name} is not available`
                );
            }

            if (findItem.quantity < quantity) {
                throw new CustomError.BadRequestError(
                    `Quantity of ${findItem.name} is not enough for this order`
                );
            }

            if (findItem) {
                subTotal += findItem.price * quantity;
            }
        }
    }

    let discount = 0;
    if (isNaN(convertedPoints) || convertedPoints < 0) {
        throw new CustomError.BadRequestError(
            "Please enter a valid positive converted points"
        );
    } else if (convertedPoints > user.points) {
        throw new CustomError.BadRequestError(
            "You do not have enough points to convert"
        );
    } else {
        discount += convertedPoints * 500;
    }

    for (let voucherCode of voucherApplied) {
        const voucher = await Voucher.findOne({
            code: voucherCode,
            isAvailable: true,
        });
        if (!voucher) {
            throw new CustomError.BadRequestError(
                `Voucher with code: ${voucherCode} is not available`
            );
        }

        if (user.voucherUsed.includes(voucherCode)) {
            throw new CustomError.BadRequestError(
                `Voucher with code: ${voucherCode} was already used`
            );
        }

        if (voucher.type === "points") {
            discount += voucher.value * 500;
        } else if (voucher.type === "percentage") {
            discount += subTotal * (voucher.value / 100);
        }
    }

    let total = subTotal - discount;
    if (total < 0) {
        total = 0;
    }

    const newOrder = await Order.create({
        customer: userId,
        orderItems,
        subTotal,
        convertedPoints,
        voucherApplied,
        discount,
        total,
    });
    res.status(StatusCodes.OK).json({ order: newOrder });

    // update user's points, voucher's used and item's quantity
    if (subTotal >= 100000) {
        user.points += 1;
    }
    user.points -= convertedPoints;
    for (let voucherCode of voucherApplied) {
        user.voucherUsed.push(voucherCode);
    }
    await user.save();

    for (let orderItem of orderItems) {
        const { item, quantity } = orderItem;
        const findItem = await Item.findOne({
            _id: mongoose.Types.ObjectId(item),
        });

        findItem.quantity -= quantity;
        await findItem.save();
    }
};

const deleteOrder = async (req, res) => {
    const {
        params: { orderId },
    } = req;

    const order = await Order.findOne({ _id: orderId });
    if (!order || !order.isAvailable) {
        throw new CustomError.BadRequestError("This order does not exist");
    }

    order.isAvailable = false;
    await order.save();
    res.status(StatusCodes.OK).json({ msg: "Order is removed" });
};

const fulfillOrder = async (req, res) => {
    const {
        params: { orderId },
    } = req;

    const order = await Order.findOne({ _id: orderId });
    if (!order || !order.isAvailable) {
        throw new CustomError.BadRequestError("This order does not exist");
    }

    order.isFulfilled = true;
    await order.save();
    res.status(StatusCodes.OK).json({ msg: "Order is fulfilled" });
};

module.exports = {
    getAllOrders,
    createOrder,
    deleteOrder,
    fulfillOrder,
};
