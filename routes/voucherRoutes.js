const express = require("express");
const router = express.Router();

const {
	authenticateUser,
	authorizePermissions,
} = require("../middleware/authentication");

const {
	getAllVouchers,
	createVoucher,
	deleteVoucher,
} = require("../controllers/voucherController");

router.get("/view", getAllVouchers);
router.post(
	"/create",
	[authenticateUser, authorizePermissions("staff")],
	createVoucher
);

router.delete(
	"/delete/:voucherId",
	[authenticateUser, authorizePermissions("staff")],
	deleteVoucher
);

module.exports = router;
