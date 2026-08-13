// /**
//  * RATE LIMITING MIDDLEWARE TEMPLATE
//  * --------------------------------
//  * Aap yahan apni Rate Limiting logic implement kar sakte hain!
//  * 
//  * Target Concepts to Practice:
//  * 1. Client identification: `req.ip` ya `req.headers['x-forwarded-for']`
//  * 2. Window tracking: Har IP k kitne requests aaye hain kisi time window me (e.g. 1 minute me max 5 requests)
//  * 3. Blocking: Jab limit exceed ho jaye, return response `res.status(429).json({ message: "Too many requests" })`
//  * 4. Rate Limit Headers:
//  *    - `X-RateLimit-Limit`: Maximum allowed requests (e.g. 5)
//  *    - `X-RateLimit-Remaining`: Total remaining requests left in current window
//  *    - `Retry-After`: Kitne seconds baad next request allow hogi
//  */

// // Example 1: In-Memory Simple Store (Custom Practice Baseline)
// const requestStore = new Map(); // IP -> { count, windowStart }

// const rateLimiter = (req, res, next) => {
//   const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

//   // TODO: AAP YAHAN APNI RATE LIMITING LOGIC LIKHEN!
//   // Abhi ye middleware direct `next()` chala raha hai taake APIs function karein.

//   /* 
//   --- UNCOMMENT AND MODIFY THIS TO START PRACTICING ---

//   const MAX_REQUESTS = 5;               // Max 5 requests
//   const WINDOW_SIZE_IN_MS = 60 * 1000;  // 1 Minute window

//   const currentTime = Date.now();
//   const clientData = requestStore.get(clientIp);

//   if (!clientData) {
//     // Pehli request is IP se
//     requestStore.set(clientIp, {
//       count: 1,
//       windowStart: currentTime
//     });
//     res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
//     res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - 1);
//     return next();
//   }

//   // Check if window has expired
//   if (currentTime - clientData.windowStart > WINDOW_SIZE_IN_MS) {
//     // Reset window
//     requestStore.set(clientIp, {
//       count: 1,
//       windowStart: currentTime
//     });
//     res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
//     res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - 1);
//     return next();
//   }

//   // Window space active, increment request count
//   clientData.count += 1;

//   if (clientData.count > MAX_REQUESTS) {
//     // Limit exceed ho chuki hai! Return HTTP Status 429
//     res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
//     res.setHeader('X-RateLimit-Remaining', 0);
//     res.setHeader('Retry-After', Math.ceil((clientData.windowStart + WINDOW_SIZE_IN_MS - currentTime) / 1000));

//     return res.status(429).json({
//       success: false,
//       error: "Too Many Requests",
//       message: `Limit exceeded! Maximum ${MAX_REQUESTS} requests per minute allowed. Try again later.`
//     });
//   }

//   res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
//   res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - clientData.count);
//   */

//   // Default passthrough (Replace with your logic above)
//   next();
// };

// module.exports = rateLimiter;

const rateLimit = require('express-rate-limit')




const limit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  message: "Too many requests, please try again later."
})


module.exports = limit