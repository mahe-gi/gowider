
    const { createOrGetPaymentOrder } = require("./lib/payments/order-service");
    const { config } = require("dotenv");
    config({ path: ".env.local" });

    process.on("message", async (msg) => {
      try {
        const result = await createOrGetPaymentOrder({
          userId: msg.userId,
          paymentIntentId: msg.paymentIntentId,
          amountPaise: msg.amountPaise,
        });
        process.send({ success: true, result });
      } catch (err) {
        process.send({ success: false, error: err.message });
      }
    });
  