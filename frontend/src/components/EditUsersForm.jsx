import { useState, useEffect } from "react";
import { editUser } from "../services/Api";

export const EditUsersForm = ({ onUpdate, currentUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(currentUser);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await editUser(currentUser.id, formData);

    if (response.status === 201) {
      setFormData({ name: "", email: "", role: "", password: "" });
    }

    onUpdate({ success: response.status === 201 });
    console.log(response);
  };

  return (
    <div>
      <h2>Edit user data</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="text"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Role:</label>
          <input
            type="text"
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
