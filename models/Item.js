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
	},
	{ timestamps: true }
);

ItemSchema.pre("remove", async function () {});

module.exports = mongoose.model("Item", ItemSchema);
