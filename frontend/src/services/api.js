const apiUrl = 'http://localhost:3000';

export const fetchUsers = async (role = 'all') => {
  const response = await fetch(`${apiUrl}/users?role=${role}`);
  return response.json();
}