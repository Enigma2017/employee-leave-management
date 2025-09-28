import pool from "../db/db.js";
import crypto, { randomBytes } from "crypto";

// Секретный ключ (32 байта для AES-256)
// Обычно хранится в .env
const SECRET_KEY = '12345678901234567890123456789012'; // 32 chars
const IV_LENGTH = 16; 
const ACCESS_TOKEN_EXPIRY = 0.5 * 60 * 1000; // 1 минута для примера

// --- Шифрование / дешифрование ---
export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

export function decrypt(tokenString) {
  const [ivHex, contentHex, tagHex] = tokenString.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    SECRET_KEY,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  let decrypted = decipher.update(contentHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// --- Вход пользователя ---
export async function signIn(email, password) {
  const query = `SELECT * FROM users WHERE email=$1 AND password=$2`;
  const values = [email, password];
  const result = await pool.query(query, values);
  const user = result.rows[0];
  if (!user) return { success: false, message: "Invalid email or password" };

  const userData = { id: user.id, email: user.email, role: user.role };
  const authData = { userData, expires: Date.now() + ACCESS_TOKEN_EXPIRY };
  const accessToken = encrypt(JSON.stringify(authData));

  // Генерация refresh token
  const refreshToken = randomBytes(32).toString("hex");
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  // Сохраняем hash в базе
  await pool.query(`UPDATE users SET refreshTokenHash=$1 WHERE id=$2`, [refreshTokenHash, user.id]);

  return { success: true, accessToken, refreshToken };
}

// --- Декодирование access token ---
export function decodeAccessToken(tokenString) {
  try {
    const decrypted = decrypt(tokenString);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

// --- Проверка и логирование access token ---
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const tokenString = authHeader.split(" ")[1];
    const tokenData = decodeAccessToken(tokenString);
    if (!tokenData) return res.status(401).json({ error: "Invalid token" });

    const timeLeft = tokenData.expires - Date.now();
    console.log(`Token for user ${tokenData.userData.email} has ${timeLeft} ms left`);

    if (timeLeft <= 0) {
      return res.status(401).json({ error: "Token expired" });
    }

    req.user = tokenData.userData;
    next();
  } catch (err) {
    console.error("Error in authenticate:", err);
    res.status(401).json({ error: "Invalid token" });
  }
}

// --- Получение пользователя по ID ---
export async function getUserById(userId) {
  const query = `SELECT id, name, email, role FROM users WHERE id=$1`;
  const values = [userId];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

// --- Обновление access token через refresh token ---
export async function refreshAccessToken(refreshTokenFromClient) {
  if (!refreshTokenFromClient) return { success: false, error: "No refresh token provided" };

  const hash = crypto.createHash("sha256").update(refreshTokenFromClient).digest("hex");
  const query = `SELECT * FROM users WHERE refreshTokenHash=$1`;
  const result = await pool.query(query, [hash]);
  const user = result.rows[0];
  if (!user) return { success: false, error: "Invalid refresh token" };

  const userData = { id: user.id, email: user.email, role: user.role };
  const authData = { userData, expires: Date.now() + ACCESS_TOKEN_EXPIRY };
  const newAccessToken = encrypt(JSON.stringify(authData));

  return { success: true, accessToken: newAccessToken };
}
