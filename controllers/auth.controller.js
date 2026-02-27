import { findUserByEmail, findUserByUsername, registerUser, saveUser } from "../services/auth.services.js";
import { sendOTP } from "../services/mail.services.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { generateOTP } from "../utils/otp.js";
import bcrypt from "bcrypt"




export async function register(req, res) {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ success: false, message: "Missing Field" });
    }

    const existing = findUserByEmail(email);
    if (existing) {
        return res.status(400).json({ status: false, message: "Email already registered" });
    }


    const otp = generateOTP();

    registerUser(username, password, email, otp);

    try {
        await sendOTP(email, otp);
        res.json({
            status: true,
            message: "otp sent to mail"
        })
    } catch (error) {
        res.json({
            status: false,
            message: "error in sending otp "
        })
    }


}

export function verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ status: false, message: "Missing field" })
    }

    const user = findUserByEmail(email);

    if (!user) {
        return res.status(400).json({ status: false, message: "user not found" });
    }
    if (Date.now() > user.otp_expiry) {
        return res.status(400).json({ status: false, message: "OTP expired" });
    }
    if (user.otp != otp) {
        return res.status(400).json({ status: false, message: "invalid otp" });
    }

    saveUser(email);
    res.cookie("token", signToken(user), {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    })
    res.json({ status: true, user, message: "user verified, created new entry in database" });

}

export function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Missing Field" });
    }
    let user = findUserByEmail(username);
    if (!user) {
        user = findUserByUsername(username);
    }
    if (!user) {
        return res.status(401).json({
            status: false,
            message: "no user found"
        })
    }
    if (!user.is_verified) {
        return res.status(403).json({
            status: false,
            message: "Please verify your email first"
        });
    }


    const match = bcrypt.compareSync(password, user.password_hash);

    if (!match) return res.status(401).json({ status: false, message: "Invalid password" });

    const token = signToken(user);
    res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    })

    return res.json({ status: true, user });

}

export function logout(req, res) {
    console.log(req.cookies)
    return res.clearCookie("token").json({
        status: true
    })
}

export function verifyUser(req, res) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            status: false,
            message: "user not logged in"
        })
    }

    return res.json({
        status: true,
        user: user
    })
}
