import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  fetchUsers,
  checkVacation,
  createVacation,
  calculateCompensation,
  deleteVacation as apiDeleteVacation
} from "../services/Api";

export const Calendar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [range, setRange] = useState(); 
  const [disabledDays, setDisabledDays] = useState([]); 
  const [status, setStatus] = useState(null); // { allowed, reason }
  const [compensation, setCompensation] = useState(null);

  const getUsers = async () => {
    const data = await fetchUsers("all");
    setUsers(data);
    if (data.length > 0) {
      setCurrentUser(data[2]);
      console.log("Current user:", data[2]);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSelect = async (range) => {
    setRange(range);
    setCompensation(null);

    if (range?.from && range?.to && currentUser) {
      // Проверяем возможность отпуска
      const data = await checkVacation(currentUser.id, range.from, range.to);
      setStatus(data);

      if (data.allowed) {
        // Рассчитываем компенсацию с учётом уже взятых дней
        const calc = await calculateCompensation(currentUser.id, range.from, range.to);
        setCompensation(calc);
      } else {
        setCompensation(null);
      }
    }
  };

  const handleConfirm = async () => {
  if (!currentUser || !range?.from || !range?.to) return;

  const response = await createVacation(currentUser.id, range.from, range.to);
  if (response.status === 201) {
    alert("Vacation request submitted!");
    setRange(undefined);
    setCompensation(null);

    // Обновляем статус с актуальными лимитами
    const updatedStatus = await checkVacation(currentUser.id, new Date(), new Date());
    setStatus(updatedStatus);

    // Обновляем пользователя с актуальными vacation
    const updatedUsers = await fetchUsers("all");
    const updatedCurrent = updatedUsers.find(u => u.id === currentUser.id);
    setCurrentUser(updatedCurrent);
  } else {
    alert("Error creating vacation");
  }
};


  const handleDeleteVacation = async (vacationId) => {
    if (!vacationId) return;

    const response = await apiDeleteVacation(vacationId);
    if (response.status === 200) {
      alert("Vacation deleted successfully");
      setCurrentUser({
        ...currentUser,
        vacations: currentUser.vacations.filter((v) => v.id !== vacationId),
      });
    } else {
      alert("Error deleting vacation");
    }
  };

  // Считаем уже взятые дни отпуска
  const totalTakenDays = currentUser?.vacations?.reduce((sum, v) => {
    const start = new Date(v.start_date);
    const end = new Date(v.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return sum + days;
  }, 0) || 0;

  return (
    <div>
      <h2>Employee Cabinet</h2>
      {currentUser ? (
        <>
          <p>Logged in as: {currentUser.name}</p>

          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            disabled={disabledDays}
          />

          {compensation && (
            <div style={{ marginTop: "10px" }}>
              <p>Оплачиваемые дни: {compensation.paidDays}</p>
              <p>Неоплачиваемые дни: {compensation.unpaidDays}</p>
              <p>Сумма компенсации: {compensation.compensation} грн</p>
              <p>Всего взято дней отпуска в этом году: {totalTakenDays}</p>
            </div>
          )}

          <button disabled={!status?.allowed} onClick={handleConfirm}>
            Confirm Vacation
          </button>

          {status && !status.allowed && <p style={{ color: "red" }}>{status.reason}</p>}

          {currentUser.vacations && currentUser.vacations.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Your Vacations:</h3>
              {currentUser.vacations.map((v) => (
                <div key={v.id}>
                  {v.start_date} - {v.end_date}{" "}
                  <button onClick={() => handleDeleteVacation(v.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};
