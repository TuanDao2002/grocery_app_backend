const express = require("express");
const router = express.Router();

const {
	authenticateUser,
	authorizePermissions,
} = require("../middleware/authentication");

const {
	getAllItems,
	getItemDetail,
	createItem,
	updateItem,
	deleteItem,
} = require("../controllers/itemController");

router.get("/view", getAllItems);
router.get("/detail/:itemId", getItemDetail);
router.post(
	"/create",
	[authenticateUser, authorizePermissions("staff")],
	createItem
);
router.put(
	"/update/:itemId",
	[authenticateUser, authorizePermissions("staff")],
	updateItem
);
router.delete(
	"/delete/:itemId",
	[authenticateUser, authorizePermissions("staff")],
	deleteItem
);

module.exports = router;
