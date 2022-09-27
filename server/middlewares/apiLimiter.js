const rateLimit = require('express-rate-limit');
const { MemoryStore } = require('express-rate-limit');

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    message:
    'Trop de tentatives de connexion à partir de cette IP, veuillez réessayer après 15 minutes',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	skipSuccessfulRequests: true, // only limit failed connection
    store: new MemoryStore(),
})


const siginLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
	message:
		'Trop de comptes créés à partir de cette IP, veuillez réessayer dans une heure',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	store: new MemoryStore(),
})

module.exports = {
	loginLimiter,
	siginLimiter
}

