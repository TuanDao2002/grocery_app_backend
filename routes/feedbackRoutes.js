const express = require("express");
const router = express.Router();

const {
	authenticateUser,
	authorizePermissions,
} = require("../middleware/authentication");

const {
	getAllFeedbacks,
	createFeedback,
} = require("../controllers/feedbackController");

router.get(
	"/view",
	[authenticateUser, authorizePermissions("staff")],
	getAllFeedbacks
);

router.post(
	"/create",
	[authenticateUser, authorizePermissions("customer")],
	createFeedback
);

module.exports = router;
