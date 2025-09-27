import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fetchUsers, checkVacation, createVacation, calculateVacation, deleteVacation as apiDeleteVacation } from "../services/Api";

export const Calendar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [range, setRange] = useState(); 
  const [disabledDays, setDisabledDays] = useState([]); 
  const [status, setStatus] = useState(null); // теперь объект { allowed, reason }
  const [compensation, setCompensation] = useState(null);
  const [takenVacations, setTakenVacations] = useState(0);

  const getUsers = async () => {
    const data = await fetchUsers("all");
    setUsers(data);
    if (data.length > 0) {
      setCurrentUser(data[2]);
      console.log('current user', data[2]); 
    }
  }; 

  useEffect(() => {
    getUsers();
  }, []);

 const handleSelect = async (range) => {
  setRange(range);
  setCompensation(null);

  if (range?.from && range?.to && currentUser) {
    // считаем занятые дни напрямую из currentUser.vacations
    const totalTakenDays = currentUser.vacations.reduce((sum, v) => {
      const start = new Date(v.start_date);
      const end = new Date(v.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    const newStart = new Date(range.from);
    const newEnd = new Date(range.to);
    const newDays = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24)) + 1;

    if (totalTakenDays + newDays > 30) {
      setStatus({ allowed: false, reason: "Exceeded maximum 30 vacation days per year" });
      return;
    }

    const data = await checkVacation(currentUser.id, range.from, range.to);
    setStatus(data);
    if (data.allowed) {
      const calc = await calculateVacation(currentUser.id, range.from, range.to);
      setCompensation(calc);
    }
  }
};


 const handleConfirm = async () => {
  if (!currentUser || !range?.from || !range?.to) return;

  const response = await createVacation(currentUser.id, range.from, range.to);
  if (response.status === 201) {
    alert("Vacation request submitted!");
    setRange(undefined);
    setStatus(null);
    setCompensation(null);

    // ✅ Обновляем пользователя с актуальными vacation
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
      alert('Vacation deleted successfully');
      setCurrentUser({
        ...currentUser,
        vacations: currentUser.vacations.filter((x) => x.id !== vacationId),
      });
    } else {
      alert('Error deleting vacation');
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

          {compensation && (
            <div style={{ marginTop: "10px" }}>
              <p>Оплачиваемые дни: {compensation.paidDays}</p>
              <p>Неоплачиваемые дни: {compensation.unpaidDays}</p>
              <p>Сумма компенсации: {compensation.compensation} грн</p>
              <p>Взятие отпусков в этом году: {takenVacations}</p>
            </div>
          )}

          <button disabled={!status?.allowed} onClick={handleConfirm}>
            Confirm Vacation
          </button>

          {status && <p>{status.reason}</p>}

          {currentUser.vacations && currentUser.vacations.length > 0 && (
            <div>
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
