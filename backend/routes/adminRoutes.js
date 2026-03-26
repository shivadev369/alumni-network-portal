const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/adminController");

router.get("/users", auth, role(["admin"]), controller.getUsers);
router.put("/approve-user/:id", auth, role(["admin"]), controller.approveUser);
router.delete("/delete-user/:id", auth, role(["admin"]), controller.deleteUser);
router.get("/analytics", auth, role(["admin"]), controller.analytics);

module.exports = router;