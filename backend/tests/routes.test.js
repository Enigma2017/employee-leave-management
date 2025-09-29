import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import router from "../routes/routes.js";

vi.mock("../services/users.services.js", () => ({
  getAllUsers: vi.fn(),
  addUser: vi.fn(),
  editUser: vi.fn(),
  deleteUser: vi.fn(),
  createUsersTable: vi.fn(),
}));

vi.mock("../services/vacation.service.js", () => ({
  createVacationsTable: vi.fn(),
  getAllVacations: vi.fn(),
  editVacation: vi.fn(),
  deleteVacation: vi.fn(),
  checkVacation: vi.fn(),
  createVacationWithCheck: vi.fn(),
  calculateCompensation: vi.fn(),
}));

vi.mock("../services/auth.services.js", () => ({
  signIn: vi.fn(),
  authenticate: vi.fn((req, res, next) => next()),
  getUserById: vi.fn(),
  refreshAccessToken: vi.fn(),
}));

describe("API Router", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(router);
  });

  it("GET /users returns users", async () => {
    const { getAllUsers } = await import("../services/users.services.js");
    getAllUsers.mockResolvedValue([{ id: 1, name: "Alice" }]);

    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: "Alice" }]);
  });

  it("POST /signin returns tokens on valid login", async () => {
    const { signIn } = await import("../services/auth.services.js");
    signIn.mockResolvedValue({ success: true, accessToken: "token", refreshToken: "refreshtoken" });

    const res = await request(app)
      .post("/signin")
      .send({ email: "a@a.com", password: "password" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("token");
    expect(res.body.refreshToken).toBe("refreshtoken");
  });

  it("POST /user creates a new user", async () => {
    const { addUser } = await import("../services/users.services.js");
    addUser.mockResolvedValue({ id: 2, name: "Bob" });

    const res = await request(app)
      .post("/user")
      .send({ name: "Bob", email: "b@b.com", role: "employee", password: "123" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Bob");
  });
});
