const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Item = require("../models/Item");
const mongoose = require("mongoose");
const categories = [
	"vegetable",
	"meat",
	"fruit",
	"diary",
	"canned",
	"snack",
	"drink",
	"spice",
	"household",
	"personal hygiene",
];

const getAllItems = async (req, res) => {
	let {
		query: { name, category, next_cursor },
	} = req;

	const queryObject = {};
	queryObject.isAvailable = true;

	if (name) {
		queryObject.name = { $regex: `${name}`, $options: "i" };
	}

	if (category) {
		queryObject.category = category;
	}

	const resultsLimitPerLoading = 10;
	if (next_cursor) {
		const [createdAt, _id] = Buffer.from(next_cursor, "base64")
			.toString("ascii")
			.split("_");

		queryObject.createdAt = { $lte: createdAt };
		queryObject._id = { $lt: _id };
	}

	let items = Item.find(queryObject).select("-description");
	items = items.sort("-createdAt -_id");
	items = items.limit(resultsLimitPerLoading);
	const results = await items;

	const count = await Item.countDocuments(queryObject);
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

const getItemDetail = async (req, res) => {
	const {
		params: { itemId },
	} = req;

	const item = await Item.findOne({ _id: itemId });

	if (!item) {
		throw new CustomError.BadRequestError("Item not found");
	}

	res.status(StatusCodes.OK).json({ item });
};

const createItem = async (req, res) => {
	const {
		body: { name, description, price, category, image, quantity },
	} = req;

	if (!name || name === "") {
		throw new CustomError.BadRequestError("Please enter name");
	}

	if (!description || description === "") {
		throw new CustomError.BadRequestError("Please enter description");
	}

	if (!price || isNaN(price) || price < 0) {
		throw new CustomError.BadRequestError(
			"Please enter a valid positive price"
		);
	}

	if (!category || category === "" || !categories.includes(category)) {
		throw new CustomError.BadRequestError("Please enter an availabe category");
	}

	if (
		!image ||
		image === "" ||
		(image !== "default" && !image.match(/^https:\/\/res.cloudinary.com\//))
	) {
		throw new CustomError.BadRequestError("Please provide a valid image");
	}

	if (!quantity || isNaN(quantity) || quantity < 0) {
		throw new CustomError.BadRequestError(
			"Please enter a valid positive quantity"
		);
	}

	const newItem = await Item.create({
		name,
		description,
		price,
		category,
		image,
		quantity,
	});

	res.status(StatusCodes.OK).json({ item: newItem });
};

const updateItem = async (req, res) => {
	const {
		params: { itemId },
		body: { name, description, price, category, image, quantity },
	} = req;

	const findItem = await Item.findOne({ _id: itemId });
	if (!findItem) {
		throw new CustomError.BadRequestError("This item does not exist");
	}

	if (!name || name === "") {
		throw new CustomError.BadRequestError("Please enter name");
	} else {
		findItem.name = name;
	}

	if (!description || description === "") {
		throw new CustomError.BadRequestError("Please enter description");
	} else {
		findItem.description = description;
	}

	if (!price || isNaN(price) || price < 0) {
		throw new CustomError.BadRequestError(
			"Please enter a valid positive price"
		);
	} else {
		findItem.price = price;
	}

	if (!category || category === "" || !categories.includes(category)) {
		throw new CustomError.BadRequestError("Please enter an availabe category");
	} else {
		findItem.category = category;
	}

	if (
		!image ||
		image === "" ||
		(image !== "default" && !image.match(/^https:\/\/res.cloudinary.com\//))
	) {
		throw new CustomError.BadRequestError("Please provide a valid image");
	} else {
		findItem.image = image;
	}

	if (!quantity || isNaN(quantity) || quantity < 0) {
		throw new CustomError.BadRequestError(
			"Please enter a valid positive quantity"
		);
	}

	await findItem.save();

	res.status(StatusCodes.OK).json({ findItem });
};

const deleteItem = async (req, res) => {
	const {
		params: { itemId },
	} = req;

	const item = await Item.findOne({ _id: itemId });
	if (!item || !item.isAvailable) {
		throw new CustomError.BadRequestError("This item does not exist");
	}

	item.isAvailable = false;
	await item.save();
	res.status(StatusCodes.OK).json({ msg: "Item is removed" });
};

module.exports = {
	getAllItems,
	getItemDetail,
	createItem,
	updateItem,
	deleteItem,
};
