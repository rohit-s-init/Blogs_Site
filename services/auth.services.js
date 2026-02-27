import db from "../config/db.js";
import bcrypt from "bcrypt"
import { generateOTP, otpExpiry } from "../utils/otp.js";
import { sendOTP } from "./mail.services.js";

const SALT_ROUND = 10;


export async function registerUser(userName, password, email, otp) {
    const hash = await bcrypt.hash(password, SALT_ROUND);
    const exp = otpExpiry();

    const [result] = await db.execute(
        `
        INSERT INTO users (username, password_hash, email, otp, otp_expiry)
        VALUES (?, ?, ?, ?, ?)
        `,
        [userName, hash, email, otp, exp]
    );

    console.log("User added to database");

    return result
}

export async function saveUser(email) {
    const [result] = await db.execute(
        `
        UPDATE users
        SET is_verified = 1,
            otp = NULL,
            otp_expiry = NULL
        WHERE email = ?
        `,
        [email]
    );

    return result.affectedRows > 0;
}

export async function findUserByUsername(username) {
    const [rows] = await db.execute(
        `
        SELECT * FROM users WHERE username = ?
        `,
        [username]
    );

    return rows[0] || null;
}
export async function findUserByEmail(email) {
    const [rows] = await db.execute(
        `
        SELECT * FROM users WHERE email = ?
        `,
        [email]
    );

    return rows[0] || null;
}



