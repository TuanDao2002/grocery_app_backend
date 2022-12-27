const express = require("express");
const router = express.Router();

const {
	authenticateUser,
	authorizePermissions,
} = require("../middleware/authentication");

const {
	getAllLocations,
	createLocation,
	deleteLocation,
} = require("../controllers/locationController");

router.get("/view", getAllLocations);
router.post(
	"/create",
	[authenticateUser, authorizePermissions("staff")],
	createLocation
);

router.delete(
	"/delete/:locationId",
	[authenticateUser, authorizePermissions("staff")],
	deleteLocation
);

module.exports = router;
