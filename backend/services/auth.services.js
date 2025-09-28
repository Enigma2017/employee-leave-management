import pool from "../db/db.js";

export async function signIn(email, password) {

    const query = `SELECT * FROM users WHERE email=$1 AND password=$2`;
    const values = [email, password];
    const result = await pool.query(query, values);
    return result.rows[0];
}   

