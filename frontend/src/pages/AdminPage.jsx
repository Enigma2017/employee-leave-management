import { useEffect, useState } from 'react';
import {fetchUsers} from '../services/Api';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers().then(data => setUsers(data));

  }, []);

  return (
    <div>
      <h1>Admin Page</h1>
      // display table of users
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}   