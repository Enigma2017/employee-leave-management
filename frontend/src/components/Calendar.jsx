import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  fetchUsers,
  checkVacation,
  calculateCompensation,
  createVacationRequest,
  deleteVacation as apiDeleteVacation
} from "../services/Api";

export const Calendar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [range, setRange] = useState(null);
  const [status, setStatus] = useState(null); // { allowed, reason, takenVacations }
  const [compensation, setCompensation] = useState(null);

  // Загрузка пользователей
  const getUsers = async () => {
    const data = await fetchUsers("all");
    setUsers(data);
    if (data.length > 0) {
      setCurrentUser(data[0]);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Выбор диапазона отпуска
  const handleSelect = async (range) => {
    setRange(range);
    setCompensation(null);
    setStatus(null);

    if (!range?.from || !range?.to || !currentUser) return;

    // Проверяем возможность отпуска
    const vacationStatus = await checkVacation(currentUser.id, range.from, range.to);
    setStatus(vacationStatus);

    if (vacationStatus.allowed) {
      // Рассчитываем компенсацию
      const calc = await calculateCompensation(currentUser.id, range.from, range.to);
      setCompensation(calc);
    }
  };

  // Подтверждение отпуска
  const handleConfirm = async () => {
    if (!currentUser || !range?.from || !range?.to || !compensation?.allowed) return;

    const result = await createVacationRequest(currentUser.id, range.from, range.to);

    if (result.error) {
      alert(result.error);
      return;
    }

    alert("Vacation created!");
    setRange(null);
    setCompensation(null);

    // Обновляем статус и данные пользователя
    const updatedUsers = await fetchUsers("all");
    const updatedCurrent = updatedUsers.find(u => u.id === currentUser.id);
    setCurrentUser(updatedCurrent);

    if (updatedCurrent?.vacations) {
      const latestVacation = updatedCurrent.vacations.find(v => v.start_date === range.from && v.end_date === range.to);
      if (latestVacation) {
        setStatus({ allowed: true, takenVacations: updatedCurrent.vacations.length });
      }
    }
  };

  // Удаление отпуска
  const handleDeleteVacation = async (vacationId) => {
    if (!vacationId) return;
    const response = await apiDeleteVacation(vacationId);

    if (response.error) {
      alert(response.error);
      return;
    }

    alert("Vacation deleted successfully");
    setCurrentUser({
      ...currentUser,
      vacations: currentUser.vacations.filter(v => v.id !== vacationId),
    });
  };

  // Подсчёт всех взятых дней отпуска
  const totalTakenDays = currentUser?.vacations?.reduce((sum, v) => {
    const start = new Date(v.start_date);
    const end = new Date(v.end_date);
    return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
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
          />

          {compensation && (
            <div style={{ marginTop: "10px" }}>
              <p>Оплачиваемые дни: {compensation.paidDays}</p>
              <p>Неоплачиваемые дни: {compensation.unpaidDays}</p>
              <p>Сумма компенсации: {compensation.compensation} грн</p>
              <p>Всего взято дней отпуска: {totalTakenDays}</p>
            </div>
          )}

          <button disabled={!status?.allowed} onClick={handleConfirm}>
            Confirm Vacation
          </button>

          {status && !status.allowed && (
            <p style={{ color: "red" }}>{status.reason}</p>
          )}

          {currentUser.vacations?.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Your Vacations:</h3>
              {currentUser.vacations.map((v) => (
                <div key={v.id}>
                  {v.start_date} - {v.end_date}{" "}
                  <button onClick={() => handleDeleteVacation(v.id)}>Delete</button>
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
