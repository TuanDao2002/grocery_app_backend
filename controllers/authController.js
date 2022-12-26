const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
	createTokenUser,
	attachCookiesToResponse,
	generateOTP,
	sendOTPtoRegister,
	sendOTPtoResetPassword,
	checkRole,
} = require("../utils");

const User = require("../models/User");
const Token = require("../models/Token");

const validator = require("validator");
const useragent = require("express-useragent");
const crypto = require("crypto");

const normalCharRegex = /^[A-Za-z0-9._-]*$/;

const register = async (req, res) => {
	let { username, password, email, phone, address } = req.body;

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

	// check if the password has at least 8 characters, has at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
	if (
		!password.match(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*].{8,}$/
		)
	) {
		throw new CustomError.BadRequestError(
			"The password must have at least 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character"
		);
	}

	if (
		!phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
	) {
		throw new CustomError.BadRequestError("The phone number is not valid");
	}

	if (!validator.isEmail(email)) {
		throw new CustomError.BadRequestError("This email is not valid");
	}

	const findDuplicate = await User.findOne({ username, email });
	if (findDuplicate) {
		if (findDuplicate.username === username) {
			throw new CustomError.BadRequestError("This username already exists");
		} else if (findDuplicate.email === email) {
			throw new CustomError.BadRequestError("This email already exists");
		}
	}

	const otp = generateOTP();
	const expires = Date.now() + 1.5 * 60 * 1000; // expires after 90 seconds
	const data = `${username}.${email}.${otp}.${expires}`;
	const hash = crypto
		.createHmac("sha256", process.env.HASH_SECRET)
		.update(data)
		.digest("hex");
	const fullHash = `${hash}.${expires}`;

	await sendOTPtoRegister(email, otp);

	res.status(StatusCodes.CREATED).json({
		hash: fullHash,
		msg: "An OTP has been sent to your email!",
	});
};

const verifyOTPtoRegister = async (req, res) => {
	let { username, password, email, phone, address, otp, hash } = req.body;

	const [hashValue, expires] = hash.split(".");

	const now = Date.now();
	if (now > parseInt(expires)) {
		throw new CustomError.UnauthenticatedError(
			"OTP is expired after 90 seconds"
		);
	}

	const data = `${username}.${email}.${otp}.${expires}`;
	const newCalculatedHash = crypto
		.createHmac("sha256", process.env.HASH_SECRET)
		.update(data)
		.digest("hex");

	if (newCalculatedHash === hashValue) {
		const role = checkRole(username, email);
		const user = await User.create({
			username,
			password,
			email,
			phone,
			role,
			address,
		});

		res.status(StatusCodes.OK).json({
			msg: `Profile with username: ${user.username} is created!`,
		});
	} else {
		throw new CustomError.BadRequestError("Invalid OTP. Please try again!");
	}
};

const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new CustomError.BadRequestError("Please provide email and password");
	}

	const user = await User.findOne({ email });
	if (!user) {
		throw new CustomError.UnauthenticatedError(
			"Email or password is not matched"
		);
	}

	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError(
			"Email or password is not matched"
		);
	}

	const tokenUser = createTokenUser(user);

	// create refresh token
	let refreshToken = "";
	// check for existing token
	const existingToken = await Token.findOne({ user: user._id });

	if (existingToken) {
		refreshToken = existingToken.refreshToken;
		attachCookiesToResponse({ res, user: tokenUser, refreshToken });
		res.status(StatusCodes.OK).json({ user: tokenUser });
		return;
	}

	refreshToken = crypto.randomBytes(40).toString("hex");
	const userAgent = req.headers["user-agent"];
	const ip = req.ip;
	const userToken = { refreshToken, ip, userAgent, user: user._id };

	await Token.create(userToken);

	attachCookiesToResponse({ res, user: tokenUser, refreshToken });

	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
	await Token.findOneAndDelete({ user: req.user.userId });

	res.cookie("accessToken", "logout", {
		httpOnly: true,
		expires: new Date(Date.now()),
	});
	res.cookie("refreshToken", "logout", {
		httpOnly: true,
		expires: new Date(Date.now()),
	});
	res.status(StatusCodes.OK).json({ msg: "Logged out!" });
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;
	if (!email || !validator.isEmail(email)) {
		throw new CustomError.BadRequestError("Please provide a valid email");
	}

	const user = await User.findOne({ email });
	if (!user) {
		throw new CustomError.NotFoundError("This email does not exist");
	}

	const otp = generateOTP();
	const expires = Date.now() + 1.5 * 60 * 1000; // expires after 90 seconds
	const data = `${email}.${otp}.${expires}`;
	const hash = crypto
		.createHmac("sha256", process.env.HASH_SECRET)
		.update(data)
		.digest("hex");
	const fullHash = `${hash}.${expires}`;

	await sendOTPtoResetPassword(email, otp);

	res.status(StatusCodes.CREATED).json({
		hash: fullHash,
		msg: "Please check your email to reset your password!",
	});
};

const resetPassword = async (req, res) => {
	let { email, newPassword, otp, hash } = req.body;

	const [hashValue, expires] = hash.split(".");

	const now = Date.now();
	if (now > parseInt(expires)) {
		throw new CustomError.UnauthenticatedError(
			"OTP is expired after 90 seconds"
		);
	}

	const data = `${email}.${otp}.${expires}`;
	const newCalculatedHash = crypto
		.createHmac("sha256", process.env.HASH_SECRET)
		.update(data)
		.digest("hex");

	if (newCalculatedHash === hashValue) {
		const user = await User.findOne({ email });
		if (!user) {
			throw new CustomError.BadRequestError("This email does not exist");
		}

		user.password = newPassword;
		await user.save();

		res.status(StatusCodes.OK).json({
			msg: "Your password is reset successfully!",
		});
	} else {
		throw new CustomError.BadRequestError("Invalid OTP. Please try again!");
	}
};

module.exports = {
	register,
	verifyOTPtoRegister,
	login,
	logout,
	forgotPassword,
	resetPassword,
};
