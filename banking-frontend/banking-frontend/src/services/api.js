export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      // Handle Unauthorized / Expired Token
      console.error("Token expired or unauthorized. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
      window.location.href = "/"; // redirect to login
      throw new Error("Unauthorized");
    }
    
    return response;
  } catch (err) {
    throw err;
  }
};
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
