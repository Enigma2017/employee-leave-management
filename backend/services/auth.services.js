import pool from "../db/db.js";
import crypto, { randomBytes } from "crypto";

// Секретный ключ (32 байта для AES-256)
// Обычно хранят в .env
const SECRET_KEY = 'nodejs course 2025'; 
const IV_LENGTH = 16; // длина вектора инициализации
const ACCESS_TOKEN_EXPIRY = '15m'; // время жизни access token

// Функция шифрования
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
    tag: authTag
  };
}

// Функция дешифрования
function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    SECRET_KEY,
    Buffer.from(encrypted.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

  let decrypted = decipher.update(encrypted.content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// --- Пример использования ---
/*const token = "userId:12345;expires:2025-10-01";
console.log("Оригинал:", token);

// Шифруем
const encrypted = encrypt(token);
console.log("Зашифровано:", encrypted);

// Дешифруем
const decrypted = decrypt(encrypted);
console.log("Расшифровано:", decrypted); */

export async function signIn(email, password) {

    const query = `SELECT * FROM users WHERE email=$1 AND password=$2`;
    const values = [email, password];
    const result = await pool.query(query, values);
    const user = result.rows[0];

    if (!user) return { success: false, message: "Invalid email or password" };
    const userData = { id: user.id, email: user.email, role: user.role };
    const authData = {userData, expires: Date.now() + 15 * 60 * 1000}; // 15 minutes
    //const accessToken = encrypt(JSON.stringify(authData));
    // For simplicity, using user ID as token (not secure, just for demo)   
    const accessToken = encrypt(JSON.stringify(authData));
    const refreshToken = randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    // add hash to user in db
    await pool.query(`UPDATE users SET refreshTokenHash=$1 WHERE id=$2`, [hash, user.id]);

    return { success: true, accessToken, refreshToken };
}   

function verifyRefreshToken(tokenFromClient, storedHash) {
  const hashToCheck = crypto.createHash("sha256").update(tokenFromClient).digest("hex");
  return hashToCheck === storedHash;
}
