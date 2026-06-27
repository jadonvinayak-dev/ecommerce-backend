const redisConnection = require('../../config/redis');

module.exports = (maxRequests, windowInSeconds) => {
    return async (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const key = `rate_limit:${ip}`;

        try {

            const multi = redisConnection.multi();
            
            multi.incr(key);
            multi.ttl(key);

            const [incrResult, ttlResult] = await multi.exec();
            
            const currentRequests = incrResult[1];
            const currentTtl = ttlResult[1];
            if (currentTtl === -1) {
                await redisConnection.expire(key, windowInSeconds);
            }

            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentRequests));

            if (currentRequests > maxRequests) {
                console.warn(`[Rate Limiter] Blocked spam request from IP: ${ip}`);
                return res.status(429).json({
                    success: false,
                    error: `Too many requests. Please try again in ${currentTtl > 0 ? currentTtl : windowInSeconds} seconds.`
                });
            }

            next();
        } catch (error) {
            console.error('[Rate Limiter Error]:', error);
            next();
        }
    };
};
