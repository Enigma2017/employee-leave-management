import pool from "../db/db.js";

// Функция для получения всех пользователей
export async function getAllUsers() {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
}

// create the table of users
export async function createUsersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            role VARCHAR(50) NOT NULL,
            password VARCHAR(100) NOT NULL
        )
    `;
    await pool.query(query);
}

// function to add a new user
export async function addUser(name, email, role, password) {
    const query = `INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [name, email, role, password];
    const result = await pool.query(query, values);
    return result.rows[0];
}   