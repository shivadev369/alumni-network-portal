const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/postController");

router.post("/", auth, role(["alumni"]), controller.createPost);
router.get("/", auth, controller.getPosts);
router.put("/:id", auth, role(["alumni"]), controller.updatePost);
router.delete("/:id", auth, role(["alumni"]), controller.deletePost);

module.exports = router;