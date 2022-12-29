const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Order = require("../models/Order");
const User = require("../models/User");
const Item = require("../models/Item");
const Voucher = require("../models/Voucher");
const mongoose = require("mongoose");

const getAllOrders = async (req, res) => {
	let {
		query: { isFulfilled, next_cursor },
	} = req;

	const queryObject = {};
	queryObject.isAvailable = true;
	queryObject.isFulfilled = isFulfilled === "true" ? true : false;

	const resultsLimitPerLoading = 10;
	if (next_cursor) {
		const [createdAt, _id] = Buffer.from(next_cursor, "base64")
			.toString("ascii")
			.split("_");

		queryObject.createdAt = { $gte: createdAt };
		queryObject._id = { $gt: _id };
	}

	let orders = Order.find(queryObject)
		.populate({
			path: "customer",
			select: "-password -voucherUsed",
		})
		.populate({
			path: "orderItems.item",
			select: "-description",
		});
	orders = orders.sort("createdAt _id");
	orders = orders.limit(resultsLimitPerLoading);
	const results = await orders;

	const count = await Order.countDocuments(queryObject);
	const remainingResults = count - results.length;
	next_cursor = null;
	if (results.length !== count) {
		const lastResult = results[results.length - 1];
		next_cursor = Buffer.from(
			lastResult.createdAt.toISOString() + "_" + lastResult._id
		).toString("base64");
	}

	res.status(StatusCodes.OK).json({
		results,
		remainingResults,
		next_cursor,
	});
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

	if (subTotal >= 100000) {
		user.points += 1;
	}
	user.points -= convertedPoints;
	for (let voucherCode of voucherApplied) {
		user.voucherUsed.push(voucherCode);
	}
	await user.save();

	res.status(StatusCodes.OK).json({ order: newOrder });
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
