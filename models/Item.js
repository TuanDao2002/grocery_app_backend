const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},

		description: {
			type: String,
			required: true,
		},

		price: {
			type: Number,
			min: [0, "Price must be positive"],
			required: true,
		},

		category: {
			type: String,
			enum: {
				values: [
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
				],
				message: "{VALUE} is not supported",
			},
			required: true,
		},

		image: {
			type: String,
			required: true,
			trim: true,
			default: "default",
		},

		quantity: {
			type: Number,
			required: true,
			min: [0, "Quanity must be postivie"],
		},

		isAvailable: {
			type: Boolean,
			default: true,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
