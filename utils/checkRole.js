const CustomError = require("../errors");
const staffList = require("./staffs.json");
const validator = require("validator");

const checkRole = (username, email) => {
    if (email == "") {
        throw new CustomError.UnauthenticatedError("Empty email");
    }

    if (!validator.isEmail(email)) {
		throw new CustomError.BadRequestError("This email is not valid");
	}
    
    for (let staff of staffList) {
        if (staff.staffName === username && staff.email === email) {
            return "staff";
        }
    }

    return "customer";
};

module.exports = checkRole;