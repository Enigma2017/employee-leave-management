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
  return response;       
}        

export const deleteUser = async (id) => {
  const response = await fetch(`${apiUrl}/user/${id}`, {
    method: 'DELETE',    
  });
  return response;   
}


// --- VACATIONS ---
export const checkVacation = async (userId, start_date, end_date) => {
  const response = await fetch(`${apiUrl}/vacations/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, start_date, end_date })
  });
  return response.json();
};

export const createVacation = async (userId, start_date, end_date) => {
  const response = await fetch(`${apiUrl}/vacations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, start_date, end_date })
  });
  return response;
};

export const fetchVacations = async () => {
  const response = await fetch(`${apiUrl}/vacations`);
  return response.json();
};

export const deleteVacation = async (id) => {
  const response = await fetch(`${apiUrl}/vacations/${id}`, {
    method: "DELETE"
  });
  return response;
};