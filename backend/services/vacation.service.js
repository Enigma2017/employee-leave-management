import pool from "../db/db.js";

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
            status VARCHAR(20) DEFAULT 'pending' -- pending / approved / rejected
        )
    `;
    await pool.query(query);
}

async function addPaidDaysColumn() {
  try {
    const query = `
      ALTER TABLE vacations
      ADD COLUMN IF NOT EXISTS compensation INT DEFAULT 0
    `;
    await pool.query(query);
    console.log("Column 'paid_days' added successfully!");
  } catch (error) {
    console.error("Error adding column 'paid_days':", error);
  } finally {
    pool.end(); // закрываем соединение
  }
}

//addPaidDaysColumn();

// get all vacations (optionally by user_id)
export async function getAllVacations(userId = null) {
    let query = `SELECT * FROM vacations`;
    const values = [];
    if (userId) {
        query += ` WHERE user_id = $1`;
        values.push(userId);
    }
    const result = await pool.query(query, values);
    return result.rows;
}

// add new vacation
export async function addVacation(userId, startDate, endDate, status = 'pending') {
    // перед вставкой сразу считаем компенсацию
    const calc = await calculateCompensation(userId, startDate, endDate);
    if (!calc.allowed) {
        throw new Error(calc.reason);
    }

    const query = `
        INSERT INTO vacations (user_id, start_date, end_date, paid_days, unpaid_days, compensation, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const values = [
        userId,
        startDate,
        endDate,
        calc.paidDays,
        calc.unpaidDays,
        calc.compensation,
        status
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// edit vacation
export async function editVacation(id, startDate, endDate, status) {
    const query = `
        UPDATE vacations
        SET start_date = $1,
            end_date = $2,
            status = $3
        WHERE id = $4
        RETURNING *
    `;
    const values = [startDate, endDate, status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// delete vacation
export async function deleteVacation(id) {
    const query = `DELETE FROM vacations WHERE id = $1`;
    await pool.query(query, [id]);
    return true;
}

/**
 * Проверяет, можно ли взять отпуск
 * - не более 2 отпусков в году
 * - нет пересечения с другими отпусками текущего пользователя
 * - возвращает { allowed: true/false, reason }
 */

// ⚡ Настройка: максимальное количество отпусков в году
const MAX_VACATIONS_PER_YEAR = 2;
const MAX_TOTAL_DAYS_PER_YEAR = 30;

export async function checkVacation(userId, startDate, endDate) {
  const year = new Date(startDate).getFullYear();

  // Получаем все отпуска пользователя за текущий год
  const query = `
    SELECT paid_days, unpaid_days
    FROM vacations
    WHERE user_id = $1
      AND EXTRACT(YEAR FROM start_date) = $2
  `;
  const result = await pool.query(query, [userId, year]);

  const takenVacations = result.rows.length;
  const totalDays = result.rows.reduce((sum, v) => sum + v.paid_days + v.unpaid_days, 0);

  if (takenVacations >= MAX_VACATIONS_PER_YEAR) {
    return {
      allowed: false,
      reason: `You cannot have more than ${MAX_VACATIONS_PER_YEAR} vacations per year`,
      takenVacations
    };
  }

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);
  const newDays = Math.ceil((newEnd - newStart) / (1000*60*60*24)) + 1;

  if (totalDays + newDays > MAX_TOTAL_DAYS_PER_YEAR) {
    return {
      allowed: false,
      reason: `You cannot take more than ${MAX_TOTAL_DAYS_PER_YEAR} vacation days per year`,
      takenVacations
    };
  }

  // Проверяем пересечение с уже существующими отпусками
  const overlapQuery = `
    SELECT 1
    FROM vacations
    WHERE user_id = $1
      AND start_date <= $3
      AND end_date >= $2
  `;
  const overlapResult = await pool.query(overlapQuery, [userId, startDate, endDate]);
  if (overlapResult.rows.length > 0) {
    return {
      allowed: false,
      reason: "This vacation overlaps with your existing vacation",
      takenVacations
    };
  }

  return {
    allowed: true,
    takenVacations
  };
}


/**
 * Рассчитывает компенсацию за отпуск
 * - максимум 20 дней оплачиваются (например, по фиксированной ставке)
 * - дополнительно можно взять до 10 дней за свой счёт
 * Возвращает { allowed, reason?, paidDays, unpaidDays, compensation }
 */
export async function calculateCompensation(userId, startDate, endDate) {
  const dailyRate = 300;
  const maxPaidDays = 20;
  const maxUnpaidDays = 10;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000*60*60*24)) + 1;

  const paidDays = Math.min(totalDays, maxPaidDays);
  const unpaidDays = Math.min(Math.max(totalDays - maxPaidDays, 0), maxUnpaidDays);

  if (paidDays + unpaidDays > maxPaidDays + maxUnpaidDays) {
    return { allowed: false, reason: `Vacation cannot exceed ${maxPaidDays + maxUnpaidDays} days` };
  }

  return {
    allowed: true,
    paidDays,
    unpaidDays,
    compensation: paidDays * dailyRate
  };
}