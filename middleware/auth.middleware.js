import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {

    const auth = req.cookies?.token;
    if (!auth) {
        return res.status(400).send("no header found");
    }

    try {
        const token = auth;

        const user = verifyToken(token)

        if (Date.now() > user.otp_expiry) {
            return res.status(400).json({ status: false, message: "OTP expired" });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "invalid token"
        })
    }
}