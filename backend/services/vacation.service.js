import pool from "../db/db.js";

// create the table of vacations
export async function createVacationsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS vacations (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,  
            end_date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' -- pending / approved / rejected
        )
    `;
    await pool.query(query);
}

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
    const query = `
        INSERT INTO vacations (user_id, start_date, end_date, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [userId, startDate, endDate, status];
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
export async function checkVacation(userId, startDate, endDate) {
    const year = new Date(startDate).getFullYear();

    // 1️⃣ Считаем, сколько отпусков уже есть у пользователя в этом году
    const countQuery = `
        SELECT COUNT(*) AS vacation_count
        FROM vacations
        WHERE user_id = $1
          AND EXTRACT(YEAR FROM start_date) = $2
    `;
    const countResult = await pool.query(countQuery, [userId, year]);
    const vacationCount = parseInt(countResult.rows[0].vacation_count, 10);

    if (vacationCount >= 2) {
        return { allowed: false, reason: "You cannot have more than 2 vacations per year" };
    }

    // 2️⃣ Проверка пересечения с существующими отпусками этого пользователя
    const overlapQuery = `
        SELECT *
        FROM vacations
        WHERE user_id = $1
          AND start_date <= $3
          AND end_date >= $2
    `;
    const overlapResult = await pool.query(overlapQuery, [userId, startDate, endDate]);
    if (overlapResult.rows.length > 0) {
        return { allowed: false, reason: "This vacation overlaps with your existing vacation" };
    }

    // ✅ Если все проверки пройдены
    return { allowed: true };
}
