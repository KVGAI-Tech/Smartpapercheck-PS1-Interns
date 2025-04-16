import { API_BASE_URL } from "../BaseURL";
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
};

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const loginUser = async (email, password, isStudent = false) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${isStudent ? "students" : "professors"}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (data.code === 200) {
      const { access_token, refresh_token } = data.data;
      setTokens(access_token, refresh_token);
      return { success: true };
    }

    throw new Error(data.message || "Login failed");
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signupUser = async (name, email, password, isStudent = false) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${isStudent ? "students" : "professors"}/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      }
    );

    const data = await response.json();

    if (data.code === 201) {
      return await loginUser(email, password);
    }

    throw new Error(data.message || "Signup failed");
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const refreshAccessToken = async () => {
  try {
    const { refreshToken } = getTokens();

    const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (data.code === 200) {
      const { access_token, refresh_token } = data.data;
      setTokens(access_token, refresh_token);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const checkAuthStatus = async () => {
  try {
    const { accessToken } = getTokens();
    if (!accessToken) return false;

    const response = await fetch(`${API_BASE_URL}/professors/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        clearTokens();
        return false;
      }
      return true;
    }

    return response.ok;
  } catch (error) {
    return false;
  }
};

export const setupTokenRefresh = () => {
  const REFRESH_INTERVAL = 13 * 60 * 1000;

  const refreshInterval = setInterval(async () => {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearInterval(refreshInterval);
      clearTokens();
      window.location.href = "/auth";
    }
  }, REFRESH_INTERVAL);

  return () => clearInterval(refreshInterval);
};
