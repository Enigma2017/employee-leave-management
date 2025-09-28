import pool from "../db/db.js";


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

// function for getting all the data of users
export async function getAllUsers(role = 'all') {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role,
      COALESCE(
        json_agg(
          json_build_object(
            'id', v.id,
            'start_date', v.start_date,
            'end_date', v.end_date,
            'status', v.status
          )
        ) FILTER (WHERE v.id IS NOT NULL),
        '[]'
      ) AS vacations
    FROM users u
    LEFT JOIN vacations v ON u.id = v.user_id
    WHERE ($1 = 'all' OR u.role = $1)
    GROUP BY u.id, u.name, u.email, u.role;
  `;

  const values = [role];
  const result = await pool.query(query, values);
  return result.rows;
}


// function to add a new user
export async function addUser(name, email, role, password) {
    const query = `INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [name, email, role, password];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// function to edite a user
export async function editUser(id, name, email, role, password) {
    const query = `UPDATE users SET name=$1, email=$2, role=$3, password=$4 WHERE id=$5 RETURNING *`;
    const values = [name, email, role, password, id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// function to delete a user
export async function deleteUser(id) {
    const query = `DELETE FROM users WHERE id=$1`;
    const values = [id];
    await pool.query(query, values);
}