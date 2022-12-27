const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
	item: {
		type: mongoose.Types.ObjectId,
		ref: "Item",
		required: true,
	},

	quantity: {
		type: Number,
		min: [0, "Quantity must be positive"],
		required: true,
	},
});

const OrderSchema = new mongoose.Schema(
	{
		customer: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},

		orderItems: {
			type: [OrderItemSchema],
			required: true,
			default: [],
		},

		subTotal: {
			type: Number,
			min: [0, "Subtotal must be positive"],
			required: true,
			default: 0,
		},

		convertedPoints: {
			type: Number,
			min: [0, "Converted points must be positive"],
			required: true,
			default: 0,
		},

		voucherApplied: {
			type: [
				{
					type: mongoose.Types.ObjectId,
					ref: "Voucher",
				},
			],

			required: true,
			default: [],
		},

		discount: {
			type: Number,
			required: true,
			default: 0,
		},

		total: {
			type: Number,
			min: [0, "Total must be positive"],
			required: true,
			default: 0,
		},

		isFulfilled: {
			type: Boolean,
			default: false,
			required: true,
		},

		isAvailable: {
			type: Boolean,
			default: true,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
