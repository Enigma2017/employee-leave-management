import { useEffect, useState } from 'react';
import {fetchUsers} from '../services/Api';
import { AddUsersForm } from '../components/AddUsersForm';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers().then(data => setUsers(data));

  }, []);

  const handleUpdate = ({success}) => {
    fetchUsers().then(data => setUsers(data));
    if (success) {
      alert('User created successfully');
    } else {
      alert('Error creating user');
    }
  };

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
      <AddUsersForm onUpdate={handleUpdate} />
    </div>
  )
}   