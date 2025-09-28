import { useNavigate } from "react-router-dom";
import { signIn } from "../services/Api";

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
      //redirect to EmployeeCabinetPage
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
    <div>
      <h2>Sign In Page</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input type="text" name="email" />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" name="password" />
          </div>
          <button type="submit">Sign In</button>
          <button onClick={autoComplete}>Auto Complete</button>
        </form> 
    </div>
  );
};  