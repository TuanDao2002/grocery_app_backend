const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Feedback = require("../models/Feedback");
const User = require("../models/User");

const getAllFeedbacks = async (req, res) => {
	let feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
	res.status(StatusCodes.OK).json({ feedbacks });
};

const createFeedback = async (req, res) => {
	let {
		user: { userId },
		body: { title, description },
	} = req;

	const user = await User.findOne({ _id: userId });
	if (!user) {
		throw new CustomError.BadRequestError("This user does not exist");
	}

	if (!title || title === "") {
		throw new CustomError.BadRequestError("Please provide title");
	}

	if (!description || description === "") {
		throw new CustomError.BadRequestError("Please provide description");
	}

	await Feedback.create({ email: user.email, title, description });
	res.status(StatusCodes.OK).json({ msg: "Your feedback was sent to staff" });
};

module.exports = {
	getAllFeedbacks,
	createFeedback,
};
