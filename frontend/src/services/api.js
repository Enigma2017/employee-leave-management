const apiUrl = 'http://localhost:3000';

export const fetchUsers = async (role = 'all') => {
  const response = await fetch(`${apiUrl}/users?role=${role}`);
  return response.json();
}

export const createUser = async (user) => {
  const response = await fetch(`${apiUrl}/user`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'        
    },
    body: JSON.stringify(user)
  });
  return response;       
}

export const editUser = async (id, user) => {
  const response = await fetch(`${apiUrl}/user/${id}`, {
    method: 'PUT',    
    headers: {
        'Content-Type': 'application/json'        
    },
    body: JSON.stringify(user)
  });
  return response.json();       
}        

export const deleteUser = async (id) => {
  const response = await fetch(`${apiUrl}/user/${id}`, {
    method: 'DELETE',    
  });
  return response.json();   
}