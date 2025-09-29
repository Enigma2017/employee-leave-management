import { describe, it, expect, beforeEach, vi } from "vitest";
import pool from "../db/db.js";
import {
  createUsersTable,
  addRefreshTokenColumn,
  getAllUsers,
  addUser,
  editUser,
  deleteUser,
} from "../services/users.services.js";

vi.mock("../db/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

describe("Users Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createUsersTable executes CREATE TABLE query", async () => {
    pool.query.mockResolvedValueOnce({});
    await createUsersTable();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS users")
    );
  });

  it("addRefreshTokenColumn adds column if not exists", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) 
      .mockResolvedValueOnce({});

    await addRefreshTokenColumn();

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("ALTER TABLE users")
    );
  });

  it("addRefreshTokenColumn does nothing if column exists", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ column_name: "refreshtokenhash" }] });
    await addRefreshTokenColumn();
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("getAllUsers returns users with vacations", async () => {
    const mockRows = [{ id: 1, name: "Alice", email: "a@a.com", role: "employee", vacations: [] }];
    pool.query.mockResolvedValueOnce({ rows: mockRows });
    const result = await getAllUsers("employee");
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ["employee"]);
    expect(result).toEqual(mockRows);
  });

  it("addUser inserts a new user", async () => {
    const user = { id: 1, name: "Bob", email: "b@b.com", role: "admin", password: "pass" };
    pool.query.mockResolvedValueOnce({ rows: [user] });
    const result = await addUser("Bob", "b@b.com", "admin", "pass");
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), [
      "Bob",
      "b@b.com",
      "admin",
      "pass",
    ]);
    expect(result).toEqual(user);
  });

  it("editUser updates a user", async () => {
    const user = { id: 1, name: "Charlie", email: "c@c.com", role: "employee", password: "newpass" };
    pool.query.mockResolvedValueOnce({ rows: [user] });
    const result = await editUser(1, "Charlie", "c@c.com", "employee", "newpass");
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE users"), [
      "Charlie",
      "c@c.com",
      "employee",
      "newpass",
      1,
    ]);
    expect(result).toEqual(user);
  });

  it("deleteUser deletes a user", async () => {
    pool.query.mockResolvedValueOnce({});
    await deleteUser(1);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM users"), [1]);
  });
});
