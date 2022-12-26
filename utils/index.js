const { createJWT, isTokenValid } = require("./jwt");
const makeVerificationToken = require("./makeVerificationToken");
const sendResetPasswordEmail = require("./sendResetPasswordEmail");
const sendVerificationEmail = require("./sendVerificationEmail");
const sendOTPtoRegister = require("./sendOTPtoRegister");
const createTokenUser = require("./createTokenUser");
const attachCookiesToResponse = require("./attachCookiesToResponse");
const generateOTP = require("./generateOTP");

module.exports = {
	createJWT,
	isTokenValid,
	makeVerificationToken,
	sendResetPasswordEmail,
	sendVerificationEmail,
	sendOTPtoRegister,
	createTokenUser,
	attachCookiesToResponse,
	generateOTP,
};
