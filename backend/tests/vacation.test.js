import { describe, it, expect, beforeEach, vi } from "vitest";
import pool from "../db/db.js";
import {
  createVacationsTable,
  getAllVacations,
  checkVacation,
  calculateCompensation,
  createVacationWithCheck,
  editVacation,
  deleteVacation,
} from "../services/vacation.service.js";

// Мокаем pool.query
vi.mock("../db/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

describe("Vacations Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createVacationsTable executes CREATE TABLE query", async () => {
    pool.query.mockResolvedValueOnce({});
    await createVacationsTable();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS vacations")
    );
  });

  it("getAllVacations returns all vacations", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, user_id: 5 }] });
    const result = await getAllVacations();
    expect(result).toEqual([{ id: 1, user_id: 5 }]);
  });

  it("getAllVacations filters by userId", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, user_id: 10 }] });
    const result = await getAllVacations(10);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE user_id = $1"),
      [10]
    );
    expect(result).toEqual([{ id: 2, user_id: 10 }]);
  });

  it("checkVacation rejects if vacations exceed per year", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { paid_days: 5, unpaid_days: 0, start_date: "2025-01-01", end_date: "2025-01-05" },
        { paid_days: 10, unpaid_days: 0, start_date: "2025-02-01", end_date: "2025-02-05" },
      ],
    });

    const result = await checkVacation(1, "2025-03-01", "2025-03-05");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("You cannot have more than");
  });

  it("calculateCompensation returns allowed with correct paid/unpaid days", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await calculateCompensation(1, "2025-04-01", "2025-04-05");
    expect(result.allowed).toBe(true);
    expect(result.paidDays).toBeGreaterThan(0);
    expect(result.compensation).toBe(result.paidDays * 300);
  });

  it("createVacationWithCheck inserts vacation if allowed", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // checkVacation
      .mockResolvedValueOnce({ rows: [] }) // calculateCompensation
      .mockResolvedValueOnce({
        rows: [{ id: 1, user_id: 1, paid_days: 3, unpaid_days: 0, compensation: 900 }],
      }) // insert
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // getAllVacations

    const result = await createVacationWithCheck(1, "2025-05-01", "2025-05-03");

    expect(result.allowed).toBe(true);
    expect(result.vacation).toHaveProperty("id", 1);
  });

  it("editVacation updates vacation", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, status: "approved" }],
    });
    const result = await editVacation(1, "2025-06-01", "2025-06-05", "approved");
    expect(result.status).toBe("approved");
  });

  it("deleteVacation deletes vacation", async () => {
    pool.query.mockResolvedValueOnce({});
    const result = await deleteVacation(1);
    expect(result).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM vacations"),
      [1]
    );
  });
});
