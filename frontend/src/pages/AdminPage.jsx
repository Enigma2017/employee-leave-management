import { useEffect, useState } from 'react';
import {fetchUsers, deleteUser} from '../services/Api';
import { AddUsersForm } from '../components/AddUsersForm';
import { EditUsersForm } from '../components/EditUsersForm';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers().then(data => setUsers(data));

  }, []);

  const handleUpdate = ({success}) => {
    fetchUsers().then(data => setUsers(data));
    if (success) {
      alert('User created/edit successfully');
    } else {
      alert('Error creating/editing user');
    }
  };

  const editHandler = (user) => {
    setShowForm('edit');
    setCurrentUser(user);
  }
  
 const deleteHandler = (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  
  if (!confirmDelete) return; //

  deleteUser(id).then(response => {
    if (response.status === 200) {
      setUsers(users.filter(user => user.id !== id));
      alert('User deleted successfully');
    } else {
      alert('Error deleting user');
    }
  });
};

  return (
    <div>
      <h1>Admin Page</h1>
      {showForm === null && <button onClick={() => setShowForm('create')}>Create new user</button>}
      {showForm !== null && <button onClick={() => setShowForm(null)}>Close form</button>}
      
      {showForm === 'create' && <AddUsersForm onUpdate={handleUpdate} />}
      {showForm === 'edit' && <EditUsersForm onUpdate={handleUpdate} currentUser={currentUser} />}
      <h2>User List</h2>
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
              <td>
                <button onClick={() => editHandler(user)}>Edit</button>
                <button onClick={() => deleteHandler(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}   