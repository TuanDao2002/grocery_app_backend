const express = require("express");
const router = express.Router();

const {
	authenticateUser,
	authorizePermissions,
} = require("../middleware/authentication");

const {
	getAllOrders,
	createOrder,
	deleteOrder,
	fulfillOrder,
} = require("../controllers/orderController");

router.get(
	"/view",
	[authenticateUser, authorizePermissions("staff")],
	getAllOrders
);

router.post(
	"/create",
	[authenticateUser, authorizePermissions("customer")],
	createOrder
);

router.delete(
	"/delete/:orderId",
	[authenticateUser, authorizePermissions("staff")],
	deleteOrder
);

router.put("/fulfill/:orderId", [
	authenticateUser,
	authorizePermissions("staff"),
    fulfillOrder
]);

module.exports = router;
