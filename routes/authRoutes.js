const express = require("express");
const router = express.Router();

const {
    authenticateUser,
} = require("../middleware/authentication");

const {
    register,
    verifyOTPtoRegister,
    login,
    logout,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

const { uploadUserImage } = require("../controllers/imageController");

router.post("/register", register);
router.post("/verify-otp-register", verifyOTPtoRegister);
router.post("/upload-image", uploadUserImage);
router.post("/login", login);
router.delete("/logout", authenticateUser, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
