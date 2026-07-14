const router =
require("express")
.Router();

const {

 sendNotification,

 getNotifications,

 markRead

} = require(
 "../controllers/notification.controller"
);

router.post(
 "/send",
 sendNotification
);

router.get(
 "/:sessionId",
 getNotifications
);

router.put(
 "/read/:id",
 markRead
);

module.exports =
router;