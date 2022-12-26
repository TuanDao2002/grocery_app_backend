const sendEmail = require("./sendEmail");

const sendOTPtoResetPassword = async (email, otp) => {
	let html = `<center><h3>There is an attempt to reset password with this email. If this is you, enter the OTP below to reset password</h3></center>
                <center><strong><h1>${otp}</h1></strong></center>`;

	return sendEmail(email, "OTP for reset password", html);
};

module.exports = sendOTPtoResetPassword;
