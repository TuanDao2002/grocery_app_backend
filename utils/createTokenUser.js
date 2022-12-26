const createTokenUser = (user) => {
	return {
		userId: user._id,
		name: user.username,
		email: user.email,
		role: user.role,
		phone: user.phone,
		address: user.address,
	};
};

module.exports = createTokenUser;
