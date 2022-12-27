const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},

		description: {
			type: String,
			required: true,
		},

		type: {
			type: String,
			enum: {
				values: ["points", "percentage"],
				message: "{VALUE} is not supported",
			},

			required: true,
		},

		value: {
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

VoucherSchema.pre("remove", async function () {
	await this.model("User").updateMany(
		{ role: "customer" },
		{
			$pull: {
				voucherUsed: this._id,
			},
		}
	);
});

module.exports = mongoose.model("Voucher", VoucherSchema);
