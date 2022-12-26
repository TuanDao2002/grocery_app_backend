const sendEmail = require("./sendEmail");

const sendOTPtoRegister = async (email, otp) => {
	let html = `<center><h3>There is an attempt to register with this email. If this is you, enter the OTP below to register</h3></center>
                <center><strong><h1>${otp}</h1></strong></center>`;

	return sendEmail(email, "OTP for register", html);
};

module.exports = sendOTPtoRegister;
