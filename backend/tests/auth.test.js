import { describe, it, expect, beforeEach, vi } from "vitest";
import pool from "../db/db.js";
import {
  encrypt,
  decrypt,
  signIn,
  decodeAccessToken,
  refreshAccessToken,
  getUserById,
} from "../services/auth.services.js";

vi.mock("../db/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("encrypt and decrypt should work correctly", () => {
    const text = "Hello World!";
    const token = encrypt(text);
    const decrypted = decrypt(token);
    expect(decrypted).toBe(text);
  });

  it("decodeAccessToken returns null for invalid token", () => {
    const result = decodeAccessToken("invalid.token.string");
    expect(result).toBeNull();
  });

  it("signIn returns failure for invalid credentials", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await signIn("wrong@a.com", "pass");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid email or password");
  });

  it("signIn returns accessToken and refreshToken for valid credentials", async () => {
    const user = { id: 1, email: "a@a.com", role: "employee" };
    pool.query
      .mockResolvedValueOnce({ rows: [user] })
      .mockResolvedValueOnce({});

    const result = await signIn("a@a.com", "password");

    expect(result.success).toBe(true);
    expect(result.accessToken).toBeTypeOf("string");
    expect(result.refreshToken).toBeTypeOf("string");
  });

  it("getUserById returns user if exists", async () => {
    const user = { id: 1, name: "Alice", email: "a@a.com", role: "employee" };
    pool.query.mockResolvedValueOnce({ rows: [user] });
    const result = await getUserById(1);
    expect(result).toEqual(user);
  });

  it("getUserById returns null if user not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await getUserById(999);
    expect(result).toBeNull();
  });

  it("refreshAccessToken returns failure if token not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await refreshAccessToken("invalidtoken");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid refresh token");
  });

  it("refreshAccessToken returns new accessToken if valid", async () => {
    const user = { id: 1, email: "a@a.com", role: "employee" };
    pool.query.mockResolvedValueOnce({ rows: [user] });
    const result = await refreshAccessToken("validtoken");
    expect(result.success).toBe(true);
    expect(result.accessToken).toBeTypeOf("string");
  });
});
