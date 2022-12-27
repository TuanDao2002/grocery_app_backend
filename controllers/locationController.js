const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Location = require("../models/Location");

const getAllLocations = async (req, res) => {
	const queryObject = {};
	queryObject.isAvailable = true;
	let locations = await Location.find(queryObject);
	res.status(StatusCodes.OK).json({ locations });
};

const createLocation = async (req, res) => {
	let {
		body: { address, latitude, longitude },
	} = req;

	if (!address || address === "") {
		throw new CustomError.BadRequestError("Please provide address");
	}

	if (isNaN(latitude)) {
		throw new CustomError.BadRequestError(
			"Please provide valid positive latitude"
		);
	}

	if (isNaN(longitude)) {
		throw new CustomError.BadRequestError(
			"Please provide valid positive longitude"
		);
	}

	const duplicateLocation = await Location.findOne({
		$or: [{ address: address }, { latitude: latitude, longitude: longitude }],
	});

	if (duplicateLocation) {
		throw new CustomError.BadRequestError("This location is already created");
	}

	const newLocation = await Location.create({
		address,
		latitude,
		longitude,
	});

	res.status(StatusCodes.OK).json({ location: newLocation });
};

const deleteLocation = async (req, res) => {
	const {
		params: { locationId },
	} = req;

	const location = await Location.findOne({ _id: locationId });
	if (!location || !location.isAvailable) {
		throw new CustomError.BadRequestError("This location does not exist");
	}

	location.isAvailable = false;
	await location.save();
	res.status(StatusCodes.OK).json({ msg: "Location is removed" });
};

module.exports = {
	getAllLocations,
	createLocation,
	deleteLocation,
};
