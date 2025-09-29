const apiUrl = 'http://localhost:3000';

async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");
  options.headers = options.headers || {};
  if (accessToken) {
    options.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("Session expired. Please login again.");

    const refreshResponse = await fetch(`${apiUrl}/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    console.log('refreshResponse', refreshResponse);  
    if (!refreshResponse.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error("Session expired. Please login again.");
    }

    const answer = await refreshResponse.json();
    console.log('answer', answer);
    const newToken = answer.accessToken.accessToken; 
    localStorage.setItem("accessToken", newToken);

    options.headers["Authorization"] = `Bearer ${newToken}`;
    response = await fetch(url, options);
  }

  return response;
}

export const fetchUsers = async (role = 'all') => {
  const response = await fetchWithAuth(`${apiUrl}/users?role=${role}`);
  return response.json();
};

// --- USERS ---

export const createUser = async (user) => {
  const response = await fetchWithAuth(`${apiUrl}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return response;
};

export const editUser = async (id, user) => {
  const response = await fetchWithAuth(`${apiUrl}/user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return response;
};

export const deleteUser = async (id) => {
  const response = await fetchWithAuth(`${apiUrl}/user/${id}`, {
    method: 'DELETE',
  });
  return response;
};

// --- VACATIONS ---
export const checkVacation = async (userId, start_date, end_date) => {
  const response = await fetchWithAuth(`${apiUrl}/vacations/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, start_date, end_date })
  });
  return response.json();
};

export const createVacation = async (userId, start_date, end_date) => {
  const response = await fetchWithAuth(`${apiUrl}/vacations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, start_date, end_date })
  });
  return response;
};

export const createVacationRequest = async (userId, start_date, end_date) => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/vacations/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, start_date, end_date })
    });

    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } 
    catch (err) { console.error("Failed to parse JSON:", err); }

    if (!response.ok) return { error: data.error || "Unknown error" };
    return { data };
  } catch (err) {
    console.error(err);
    return { error: "Network error" };
  }
};

export const fetchVacations = async () => {
  const response = await fetchWithAuth(`${apiUrl}/vacations`);
  return response.json();
};

export const deleteVacation = async (id) => {
  const response = await fetchWithAuth(`${apiUrl}/vacations/${id}`, { method: "DELETE" });
  return response;
};

export const editVacation = async (id, vacation) => {
  const response = await fetchWithAuth(`${apiUrl}/vacations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vacation)
  });
  return response;
};

export const calculateCompensation = async (userId, start_date, end_date) => {
  const params = new URLSearchParams({ userId, start: start_date, end: end_date });
  const response = await fetchWithAuth(`${apiUrl}/vacations/calculate?${params}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { error: true, message: errorData.message || "Error calculating compensation" };
  }
  return response.json();
};

// --- CURRENT USER ---
export const fetchCurrentUser = async () => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/me`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch user data");
    }
    const data = await response.json();
    return data.user;
  } catch (err) {
    console.error("Error fetching current user:", err.message);
    return null;
  }
};


export const signIn = async (email, password) => {
  const response = await fetch(`${apiUrl}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
