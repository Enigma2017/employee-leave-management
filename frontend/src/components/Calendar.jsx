import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  fetchUsers,
  fetchVacations,
  checkVacation,
  calculateCompensation,
  createVacationRequest,
  deleteVacation as apiDeleteVacation
} from "../services/Api";

export const Calendar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [range, setRange] = useState(null);
  const [status, setStatus] = useState(null);
  const [compensation, setCompensation] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");

  // Загрузка пользователей и отпусков
  useEffect(() => {
    const loadData = async () => {
      const usersData = await fetchUsers("all");
      setUsers(usersData);

      if (usersData.length > 0) {
        const firstUser = usersData[0];

        // Загружаем отпуска с сервера
        const vacations = await fetchVacations();
        const userVacations = vacations.filter(
          (v) => v.user_id === firstUser.id
        );

        setCurrentUser({ ...firstUser, vacations: userVacations });
      }
    };

    loadData();
  }, []);

  // Подсчёт всех уже использованных дней
  const totalTakenDays =
    currentUser?.vacations?.reduce((sum, v) => {
      const start = new Date(v.start_date);
      const end = new Date(v.end_date);
      return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }, 0) || 0;

  // Проверка лимита отпусков
 const handleBlockVacation = (msg = "30 дней уже использованы. Новый отпуск невозможен.") => {
  setBlocked(true);
  setBlockedMessage(msg);
  console.warn("Vacation blocked:", msg);
};
  const handleSelect = async (selectedRange) => {
  setRange(selectedRange);
  setStatus(null);
  setCompensation(null);
  setBlocked(false);
  setBlockedMessage("");

  if (!selectedRange?.from || !selectedRange?.to || !currentUser) return;

  // Проверка лимитов (третий отпуск или больше 30 дней)
  if (currentUser.vacations.length >= 2 || totalTakenDays >= 30) {
    handleBlockVacation();
    return;
  }

  // Проверка возможности отпуска через сервер
  const vacationStatus = await checkVacation(
    currentUser.id,
    selectedRange.from,
    selectedRange.to
  );
  setStatus(vacationStatus);

  if (vacationStatus.allowed) {
    const calc = await calculateCompensation(
      currentUser.id,
      selectedRange.from,
      selectedRange.to
    );

    if (calc.error) {
      // тут перехватываем ошибку 400 и блокируем
      handleBlockVacation(calc.message);
      return;
    }

    setCompensation(calc);
  }
};

  const handleConfirm = async () => {
    if (
      !currentUser ||
      !range?.from ||
      !range?.to ||
      !compensation?.allowed ||
      blocked
    )
      return;

    // Создаём отпуск на сервере
    const result = await createVacationRequest(
      currentUser.id,
      range.from,
      range.to
    );

    if (result.error) {
      alert(result.error);
      return;
    }

    alert("Vacation created!");

    // Обновляем локальное состояние с актуальными отпусками с сервера
    const vacations = result.data.vacations || [];
    setCurrentUser((prev) => ({ ...prev, vacations }));

    // Сбрасываем форму
    setRange(null);
    setStatus(null);
    setCompensation(null);
  };

  const handleDeleteVacation = async (vacationId) => {
    if (!vacationId) return;

    const response = await apiDeleteVacation(vacationId);
    if (response.error) {
      alert(response.error);
      return;
    }

    // Обновляем локальные отпуска
    setCurrentUser((prev) => ({
      ...prev,
      vacations: prev.vacations.filter((v) => v.id !== vacationId)
    }));
    setBlocked(false); // вдруг после удаления снова стало можно
    setBlockedMessage("");
  };

  return (
    <div>
      <h2>Employee Cabinet</h2>
      {currentUser ? (
        <>
          <p>Logged in as: {currentUser.name}</p>

          <DayPicker mode="range" selected={range} onSelect={handleSelect} />

          {compensation && !blocked && (
            <div style={{ marginTop: "10px" }}>
              <p>Оплачиваемые дни: {compensation.paidDays}</p>
              <p>Неоплачиваемые дни: {compensation.unpaidDays}</p>
              <p>Сумма компенсации: {compensation.compensation} грн</p>
              <p>Всего взято дней отпуска: {totalTakenDays}</p>
            </div>
          )}

          <button disabled={blocked || !status?.allowed} onClick={handleConfirm}>
            Confirm Vacation
          </button>

          {blocked && (
            <p style={{ color: "red", fontWeight: "bold" }}>{blockedMessage}</p>
          )}

          {status && !status.allowed && !blocked && (
            <p style={{ color: "red" }}>{status.reason}</p>
          )}

          {currentUser.vacations?.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Your Vacations:</h3>
              {currentUser.vacations.map((v) => {
                const start = new Date(v.start_date);
                const end = new Date(v.end_date);
                const vacationDays =
                  Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                // форматируем даты
                const startFormatted = start.toLocaleDateString("uk-UA");
                const endFormatted = end.toLocaleDateString("uk-UA");

                return (
                  <div key={v.id} style={{ marginBottom: "10px" }}>
                    <strong>{startFormatted} - {endFormatted}</strong>
                    <div>Количество дней отпуска: {vacationDays}</div>
                    <div>Сумма компенсации: {v.compensation ?? 0} грн</div>
                    <button onClick={() => handleDeleteVacation(v.id)}>
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};
