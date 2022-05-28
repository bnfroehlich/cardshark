const User = require("../model/User")

const express = require("express")
const router = express.Router()
const { register, login, update, deleteUser, check } = require("./auth")
const { adminAuth } = require("../middleware/auth")

router.route("/register").post(register)
router.route("/login").post(login);
router.route("/update").put(adminAuth, update)
router.route("/deleteUser").delete(adminAuth, deleteUser)
router.route("/check").get(check);

module.exports = router