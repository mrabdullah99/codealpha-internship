import axios from "./axiosConfig.js";

export const registerUser = async (userData) => {
  try {
    const response = await axios.post("/auth/register", userData);
    console.log(response.data);
    return response;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};
export const loginUser = async (userData) => {
  try {
    const response = await axios.post("/auth/login", userData);
    console.log(response.data);
    return response;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const response = await axios.get("/products");
    return response;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};
export const sendMessageToAI = async (messages) => {
  const response = await axios.post("/chatbot", { messages });
  return response.data;
};

// ----------------Using Fetch API---------------------

// const API_URL = "http://localhost:5000/api/user";

// export const loginUserApi = async (data) => {
//   const res = await fetch(`${API_URL}/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
//   return res.json();
// };

// export const registerUserApi = async (userData) => {
//   try {
//     const response = await fetch("http://localhost:5000/api/user/register", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });
//     return await response.json();
//   } catch (error) {
//     console.error(error);
//   }
// };
