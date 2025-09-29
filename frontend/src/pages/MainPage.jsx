import React, { useEffect, useState } from "react";
import { fetchUsers, fetchVacations, calculateCompensation } from "../services/Api";

export const MainPage = () => {
  const [users, setUsers] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await fetchUsers();
        const vacationsData = await fetchVacations();

        const usersWithVacations = await Promise.all(
          usersData.map(async (user) => {
            const userVacations = vacationsData.filter(v => v.user_id === user.id);

            const vacationsWithComp = await Promise.all(
              userVacations.map(async (vac) => {
                const comp = await calculateCompensation(user.id, vac.start_date, vac.end_date);
                return {
                  ...vac,
                  paidDays: comp.paidDays || 0,
                  unpaidDays: comp.unpaidDays || 0,
                  compensation: comp.compensation || 0
                };
              })
            );

            return { ...user, vacations: vacationsWithComp };
          })
        );

        setUsers(usersWithVacations);
        setVacations(vacationsData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Employees and Vacations</h1>
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Email</th>
            <th>Role</th>
            <th>Vacation Period</th>
            <th>Status</th>
            <th>Paid Days</th>
            <th>Unpaid Days</th>
            <th>Compensation</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) =>
            user.vacations.length > 0 ? (
              user.vacations.map((vac) => (
                <tr key={vac.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {new Date(vac.start_date).toLocaleDateString()} -{" "}
                    {new Date(vac.end_date).toLocaleDateString()}
                  </td>
                  <td>{vac.status}</td>
                  <td>{vac.paidDays}</td>
                  <td>{vac.unpaidDays}</td>
                  <td>{vac.compensation} ₴</td>
                </tr>
              ))
            ) : (
              <tr key={`user-${user.id}`}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No vacations
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};
