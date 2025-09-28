export const VacationCard = ({ vacation, onDelete }) => {
  const { start_date, end_date, paid_days, unpaid_days, compensation, id } = vacation;
  const totalDays = (paid_days || 0) + (unpaid_days || 0);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <p><strong>Dates:</strong> {start_date} - {end_date}</p>
      <p><strong>Total days:</strong> {totalDays} ({paid_days} paid / {unpaid_days} unpaid)</p>
      <p><strong>Compensation:</strong> {compensation} грн</p>
      <button onClick={() => onDelete(id)}>Delete</button>
    </div>
  );
};
