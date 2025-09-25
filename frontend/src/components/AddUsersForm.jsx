import { createUser } from "../services/Api";

export const AddUsersForm = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);    
    const response = await createUser(data);    
    console.log(response);    
  } 

  return(
    <div>
      <h2>create user form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>        
          <input type="text" name="name" />
        </div>
        <div>
          <label>Email:</label>        
          <input type="text" name="email" />
        </div>
        <div>
          <label>Role:</label>        
          <input type="text" name="role" />
        </div>
        <div>
          <label>Password:</label>        
          <input type="password" name="password" />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
    
  )
}   