import { useNavigate } from "react-router-dom";
import { signIn } from "../services/Api";
import "../styles/signin.css";

export const SignInPage = () => {
   const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");
    const response = await signIn(email, password);
    if (response.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      alert("Sign in successful!");
        navigate("/employee");

    } else {
      alert("Sign in failed: " + (response.error || "Unknown error"));
    }
    console.log(response);
  };

  const autoComplete = (event) => {
    event.preventDefault();
    const form = event.currentTarget.form;
    form.email.value = "";
    form.password.value = "";
  };

return (
  <div className="container">
    <div className="form-card">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit} className="signin-form">
        <div className="form-group">
          <label>Email:</label>
          <input type="text" name="email" />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" />
        </div>
        <div className="button-group">
          <button type="submit">Sign In</button>
          <button type="button" onClick={autoComplete}>Auto Complete</button>
        </div>
      </form>
    </div>
  </div>
);
};  