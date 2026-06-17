import admin from "./firebase.js";

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data,
    android: { priority: "high" },
    apns: { payload: { aps: { sound: "default" } } },
  };

  try {
    return await admin.messaging().send(message);
  } catch (err) {
    console.error("🔥 Push notification error:", err);
    throw err;
  }
};

// export const sendPushToMultipleTokens = async (fcmTokens, title, body, data = {}) => {
//   const message = {
//     tokens: fcmTokens,
//     notification: {
//       title,
//       body,
//     },
//     data,
//     android: { priority: "high" },
//     apns: { payload: { aps: { sound: "default" } } },
//   };

// }

export const sendMultipleNotificationToUsers = async (
  tokens,
  title,
  body,
  data = {}
) => {
  try {
    const message = {
      tokens,
      notification: {
        title,
        body,
      },
      data,
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    console.log(
      `Success: ${response.successCount}`
    );

    console.log(
      `Failed: ${response.failureCount}`
    );

    return response;
  } catch (error) {
    console.error(error);
  }
};