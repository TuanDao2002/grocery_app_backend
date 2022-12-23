const createTokenUser = (user) => {
	return {
		userId: user._id,
		name: user.username,
		email: user.email,
		avatar: user.avatar,
		latitude: user.latitude,
		longitude: user.longitude,
	};
};

module.exports = createTokenUser;
