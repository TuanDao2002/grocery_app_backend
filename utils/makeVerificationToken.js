const { createJWT } = require("./jwt");

const makeVerificationToken = (
	username,
	email,
	password,
	avatar,
	latitude,
	longitude,
	secretKey,
	minutesToExpire
) => {
	const expirationDate = new Date();
	expirationDate.setMinutes(new Date().getMinutes() + minutesToExpire); // verification toke expires after a given minutes
	return createJWT(
		{
			payload: {
				username,
				email,
				password,
				avatar,
				latitude,
				longitude,
				expirationDate,
			},
		},
		secretKey
	);
};

module.exports = makeVerificationToken;
