import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fetchUsers, checkVacation, createVacation } from "../services/Api";

export const Calendar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [range, setRange] = useState(); // диапазон дат
  const [disabledDays, setDisabledDays] = useState([]); // недоступные дни
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Загружаем пользователей
    fetchUsers("employee").then((data) => {
      setUsers(data);

      // ⚡ пока что просто берём первого сотрудника как "текущего"
      if (data.length > 0) {
        setCurrentUser(data[0]);
      }
    });
  }, []);

  const handleSelect = async (range) => {
    setRange(range);

    if (range?.from && range?.to && currentUser) {
      const data = await checkVacation(currentUser.id, range.from, range.to);
      setStatus(data.allowed ? "available" : data.reason);
    }
  };

  const handleConfirm = async () => {
    if (!currentUser || !range?.from || !range?.to) return;

    const response = await createVacation(currentUser.id, range.from, range.to);
    if (response.status === 201) {
      alert("Vacation request submitted!");
      setRange(undefined);
      setStatus(null);
    } else {
      alert("Error creating vacation");
    }
  };

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

          <button disabled={status !== "available"} onClick={handleConfirm}>
            Confirm Vacation
          </button>
          {status && <p>{status}</p>}
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};
