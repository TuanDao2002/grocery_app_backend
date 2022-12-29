const { createJWT, isTokenValid } = require("./jwt");
const makeVerificationToken = require("./makeVerificationToken");
const sendOTPtoRegister = require("./sendOTPtoRegister");
const sendOTPtoResetPassword = require("./sendOTPtoResetPassword");
const createTokenUser = require("./createTokenUser");
const attachCookiesToResponse = require("./attachCookiesToResponse");
const generateOTP = require("./generateOTP");
const checkRole = require("./checkRole");
const connectedUsers = require("./connectedUsers");

module.exports = {
	createJWT,
	isTokenValid,
	makeVerificationToken,
	sendOTPtoRegister,
	sendOTPtoResetPassword,
	createTokenUser,
	attachCookiesToResponse,
	generateOTP,
	checkRole,
	connectedUsers
};
