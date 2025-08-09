const { verifyToken } = require('@clerk/backend');

async function requireClerkAuth(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  const token = header.slice(7).trim();
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    const err = new Error('Server auth config missing');
    err.status = 500;
    throw err;
  }
  const { sub, sid, email, claims } = await verifyToken(token, { secretKey });
  return { userId: sub, sessionId: sid, email, claims };
}

module.exports = { requireClerkAuth };