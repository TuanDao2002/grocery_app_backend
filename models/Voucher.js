const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
		},

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
				values: ["value", "percentage"],
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

VoucherSchema.pre("save", async function () {
	await this.model("User").updateMany({
		$pull: {
			voucherUsed: this.code,
		},
	});
});

module.exports = mongoose.model("Voucher", VoucherSchema);
