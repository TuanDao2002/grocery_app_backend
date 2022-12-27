const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Please provide username"],
			minlength: [3, "Length must be greater than 3"],
			maxlength: [22, "Length must be less than 22"],
			trim: true,
			unique: true,
		},

		email: {
			type: String,
			required: [true, "Please provide email"],
			unique: true,
			trim: true,
			validate: {
				validator: validator.isEmail,
				message: "Please provide valid email",
			},
		},

		phone: {
			type: String,
			required: true,
		},

		password: {
			type: String,
			required: true,
		},

		role: {
			type: String,
			enum: {
				values: ["customer", "staff"],
				message: "{VALUE} is not supported",
			},
		},

		address: {
			type: String,
		},

		points: {
			type: Number,
		},

		voucherUsed: {
			type: [
				{
					type: mongoose.Types.ObjectId,
					ref: "Voucher",
				},
			],

			default: [],
		},
	},
	{ timestamps: true }
);

UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
	const isMatch = await bcrypt.compare(canditatePassword, this.password);
	return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
