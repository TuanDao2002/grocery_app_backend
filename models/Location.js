const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
	{
		address: {
			type: String,
			required: true,
		},

		latitude: {
			type: Number,
			required: true,
		},

		longitude: {
			type: Number,
			required: true,
		},

		isAvailable: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Location", LocationSchema);
