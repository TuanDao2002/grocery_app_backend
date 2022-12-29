const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Voucher = require("../models/Voucher");
const mongoose = require("mongoose");
const types = ["points", "percentage"];
const { connectedUsers } = require("../utils");
const notifySocket = require("../socket/notify");

const getAllVouchers = async (req, res) => {
	let {
		query: { next_cursor },
	} = req;

	const queryObject = {};
	queryObject.isAvailable = true;

	const resultsLimitPerLoading = 10;
	if (next_cursor) {
		const [createdAt, _id] = Buffer.from(next_cursor, "base64")
			.toString("ascii")
			.split("_");

		queryObject.createdAt = { $lte: createdAt };
		queryObject._id = { $lt: _id };
	}

	let vouchers = Voucher.find(queryObject);
	vouchers = vouchers.sort("-createdAt -_id");
	vouchers = vouchers.limit(resultsLimitPerLoading);
	const results = await vouchers;

	const count = await Voucher.countDocuments(queryObject);
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

const createVoucher = async (req, res) => {
	const {
		body: { code, title, description, type, value },
	} = req;

	if (!code || code === "") {
		throw new CustomError.BadRequestError("Please provide code");
	}

	if (!title || title === "") {
		throw new CustomError.BadRequestError("Please provide title");
	}

	if (!description || description === "") {
		throw new CustomError.BadRequestError("Please provide description");
	}

	if (!type || type === "" || !types.includes(type)) {
		throw new CustomError.BadRequestError("Please provide valid type");
	}

	if (!value || isNaN(value) || value <= 0) {
		throw new CustomError.BadRequestError(
			"Please provide valid positive value"
		);
	} else if (type === "percentage" && value >= 100) {
		throw new CustomError.BadRequestError(
			"The value of voucher should not be larger than the order's price"
		);
	}

	const findDuplicateCode = await Voucher.findOne({
		code: code,
		isAvailable: true,
	});
	if (findDuplicateCode) {
		throw new CustomError.BadRequestError(
			"The code for this voucher is the same with another one"
		);
	}

	const newVoucher = await Voucher.create({
		code,
		title,
		description,
		type,
		value,
	});

	notifySocket(req.app.io, newVoucher);

	res.status(StatusCodes.OK).json({ voucher: newVoucher });
};

const deleteVoucher = async (req, res) => {
	const {
		params: { voucherId },
	} = req;

	const voucher = await Voucher.findOne({ _id: voucherId });
	if (!voucher || !voucher.isAvailable) {
		throw new CustomError.BadRequestError("This voucher does not exist");
	}

	voucher.isAvailable = false;
	await voucher.save();
	res.status(StatusCodes.OK).json({ msg: "Voucher is removed" });
};

module.exports = {
	getAllVouchers,
	createVoucher,
	deleteVoucher,
};
