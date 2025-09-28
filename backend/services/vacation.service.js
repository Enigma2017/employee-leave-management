import pool from "../db/db.js";

const MAX_VACATIONS_PER_YEAR = 2;
const MAX_TOTAL_DAYS_PER_YEAR = 30;
const MAX_PAID_DAYS = 20;
const MAX_UNPAID_DAYS = 10;
const DAILY_RATE = 300;

// create the table of vacations
export async function createVacationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS vacations (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      paid_days INT DEFAULT 0,
      unpaid_days INT DEFAULT 0,
      compensation NUMERIC DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending'
    )
  `;
  await pool.query(query);
}

// getting all vacations
export async function getAllVacations(userId = null) {
  let query = `SELECT * FROM vacations`;
  const values = [];
  if (userId) {
    query += ` WHERE user_id = $1 ORDER BY start_date ASC`;
    values.push(userId);
  }
  const result = await pool.query(query, values);
  return result.rows;
}

// checking a vacation for overlaps and limits
export async function checkVacation(userId, startDate, endDate) {
  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);
  const requestedDays = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24)) + 1;

  // geeting all vacations of the user that overlap with the requested range
  const { rows: vacations } = await pool.query(
    `SELECT paid_days, unpaid_days, start_date, end_date 
     FROM vacations
     WHERE user_id = $1
       AND NOT (end_date < $2 OR start_date > $3)
       AND status != 'cancelled'`,
    [userId, newStart, newEnd]
  );

  // the limit of vacations per year
  if (vacations.length >= MAX_VACATIONS_PER_YEAR) {
    return {
      allowed: false,
      reason: `You cannot have more than ${MAX_VACATIONS_PER_YEAR} vacations per year`,
      used: { days: vacations.reduce((sum, v) => sum + v.paid_days + v.unpaid_days, 0), segments: vacations.length }
    };
  }

  // the check for overlaps
  for (const v of vacations) {
    const vStart = new Date(v.start_date);
    const vEnd = new Date(v.end_date);
    if (!(newEnd < vStart || newStart > vEnd)) {
      return {
        allowed: false,
        reason: "This vacation overlaps with an existing vacation",
        used: { days: vacations.reduce((sum, v) => sum + v.paid_days + v.unpaid_days, 0), segments: vacations.length }
      };
    }
  }

  // the check for total days per year
  const usedDays = vacations.reduce((sum, v) => sum + v.paid_days + v.unpaid_days, 0);
  if (usedDays + requestedDays > MAX_TOTAL_DAYS_PER_YEAR) {
    return {
      allowed: false,
      reason: `Total vacation days exceeded. Already used: ${usedDays}`,
      used: { days: usedDays, segments: vacations.length }
    };
  }

  return {
    allowed: true,
    used: { days: usedDays, segments: vacations.length }
  };
}

// calculation of compensation
export async function calculateCompensation(userId, startDate, endDate) {
  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);
  const requestedDays = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24)) + 1;

  // getting all vacations of the user to calculate used days this year
  const { rows: vacations } = await pool.query(
    `SELECT paid_days, unpaid_days, start_date, end_date 
     FROM vacations
     WHERE user_id = $1
       AND status != 'cancelled'`,
    [userId]
  );

  // calculating used days
  const usedPaid = vacations.reduce((sum, v) => sum + v.paid_days, 0);
  const usedUnpaid = vacations.reduce((sum, v) => sum + v.unpaid_days, 0);
  const usedTotal = usedPaid + usedUnpaid;

  const remainingTotal = MAX_TOTAL_DAYS_PER_YEAR - usedTotal;
  const remainingPaid = Math.max(MAX_PAID_DAYS - usedPaid, 0);
  const remainingUnpaid = Math.max(MAX_UNPAID_DAYS - usedUnpaid, 0);

  if (requestedDays > remainingTotal) {
    return {
      allowed: false,
      reason: `Not enough total vacation days left. Remaining: ${remainingTotal}`,
      used: { days: usedTotal, segments: vacations.length }
    };
  }

  // determining how many days can be paid and unpaid
  const maxAvailableDays = Math.min(remainingPaid + remainingUnpaid, remainingTotal);
  const paidDays = Math.min(requestedDays, remainingPaid, maxAvailableDays);
  const unpaidDays = Math.min(requestedDays - paidDays, remainingUnpaid, maxAvailableDays - paidDays);

  return {
    allowed: true,
    paidDays,
    unpaidDays,
    compensation: paidDays * DAILY_RATE,
    used: { days: usedTotal, segments: vacations.length }
  };
}

// creating a vacation with all checks and calculations
export async function createVacationWithCheck(userId, startDate, endDate) {

  const check = await checkVacation(userId, startDate, endDate);
  if (!check.allowed) return { allowed: false, reason: check.reason };

  const calc = await calculateCompensation(userId, startDate, endDate);
  if (!calc.allowed) return { allowed: false, reason: calc.reason };

  const result = await pool.query(
    `INSERT INTO vacations (user_id, start_date, end_date, paid_days, unpaid_days, compensation, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
    [userId, startDate, endDate, calc.paidDays, calc.unpaidDays, calc.compensation]
  );

  const vacations = await getAllVacations(userId);

  return {
    allowed: true,
    vacation: result.rows[0],
    vacations,
    paidDays: calc.paidDays,
    unpaidDays: calc.unpaidDays,
    compensation: calc.compensation,
    used: { days: calc.used?.days || 0, segments: calc.used?.segments || 0 }
  };
}

// editing a vacation
export async function editVacation(id, startDate, endDate, status) {
  const result = await pool.query(
    `UPDATE vacations SET start_date=$1, end_date=$2, status=$3 WHERE id=$4 RETURNING *`,
    [startDate, endDate, status, id]
  );
  return result.rows[0];
}

// deleting a vacation
export async function deleteVacation(id) {
  await pool.query(`DELETE FROM vacations WHERE id=$1`, [id]);
  return true;
}
