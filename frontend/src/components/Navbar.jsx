import { NavLink } from "react-router-dom";

export const Navbar = () => {
  const linkStyle = ({ isActive }) => ({
    padding: "6px 12px",
    textDecoration: "none",
    borderRadius: "6px",
    background: isActive ? "#007bff" : "#e0e0e0",
    color: isActive ? "white" : "black",
  });

  return (
    <div style={{ padding: "10px", background: "#f0f0f0" }}>
      <nav style={{ display: "flex", gap: "10px" }}>
        <NavLink to="/" style={linkStyle}>
          Sign In
        </NavLink>
        <NavLink to="/employee" style={linkStyle}>
          Employee Cabinet
        </NavLink>
        <NavLink to="/admin" style={linkStyle}>
          Admin
        </NavLink>
        <NavLink to="/main" style={linkStyle}>
          Main
        </NavLink>
      </nav>
    </div>
  );
};
