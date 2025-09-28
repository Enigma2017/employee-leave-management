import pool from "../db/db.js";
import crypto, { randomBytes } from "crypto";

// Секретный ключ (32 байта для AES-256)
// Обычно хранится в .env
const SECRET_KEY = '12345678901234567890123456789012'; // 32 chars
const IV_LENGTH = 16; // длина вектора инициализации
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 минут в мс

// Функция шифрования — возвращает одну строку: iv:content:tag
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

// Функция дешифрования — принимает строку iv:content:tag
function decrypt(tokenString) {
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

// Функция входа пользователя
export async function signIn(email, password) {
  const query = `SELECT * FROM users WHERE email=$1 AND password=$2`;
  const values = [email, password];
  const result = await pool.query(query, values);
  const user = result.rows[0];

  if (!user) return { success: false, message: "Invalid email or password" };

  // Данные пользователя для токена
  const userData = { id: user.id, email: user.email, role: user.role };
  const authData = { userData, expires: Date.now() + ACCESS_TOKEN_EXPIRY };

  // Генерация access token (одна строка)
  const accessToken = encrypt(JSON.stringify(authData));

  // Генерация refresh token
  const refreshToken = randomBytes(32).toString("hex");
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  // Сохраняем хэш refresh token в базе
  await pool.query(
    `UPDATE users SET refreshTokenHash=$1 WHERE id=$2`,
    [refreshTokenHash, user.id]
  );

  return { success: true, accessToken, refreshToken };
}

// Проверка refresh token
export function verifyRefreshToken(tokenFromClient, storedHash) {
  const hashToCheck = crypto.createHash("sha256").update(tokenFromClient).digest("hex");
  return hashToCheck === storedHash;
}

// Декодирование access token
export function decodeAccessToken(tokenString) {
  try {
    const decrypted = decrypt(tokenString);
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}
