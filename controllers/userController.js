const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const User = require("../models/User");

const normalCharRegex = /^[A-Za-z0-9._-]*$/;

const editUserProfile = async (req, res) => {
	const {
		user: { userId },
		body: { username, phone, address },
	} = req;

	const user = await User.findOne({ _id: userId }, { password: 0 });

	if (!user) {
		throw new CustomError.BadRequestError("This user does not exist");
	}

	if (username.length < 3 || username.length > 22) {
		throw new CustomError.BadRequestError(
			"The username must have from 3 to 22 characters"
		);
	}

	// prevent SQL injection
	if (!username.match(normalCharRegex)) {
		throw new CustomError.BadRequestError(
			"The username must not have strange characters"
		);
	}

	if (
		!phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
	) {
		throw new CustomError.BadRequestError("The phone number is not valid");
	}

	if (username) {
		user.username = username;
	}

	if (phone) {
		user.phone = phone;
	}

	if (address) {
		user.address = address;
	}

	await user.save();
	res.status(StatusCodes.OK).json({ user });
};

const getUserProfile = async (req, res) => {
	const {
		params: { userId },
	} = req;

	const user = await User.findOne({ _id: userId }, { password: 0 });

	if (!user) {
		throw new CustomError.BadRequestError("This user does not exist");
	}

	res.status(StatusCodes.OK).json({ user });
};

module.exports = {
	editUserProfile,
	getUserProfile,
};
