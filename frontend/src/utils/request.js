const BASE_URL = "http://localhost:3000/api";

export const request = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "请求失败");
    }

    return data;
  } catch (error) {
    console.error("API请求错误:", error);
    throw error;
  }
};

export const get = (url, options = {}) => {
  return request(url, { ...options, method: "GET" });
};

export const post = (url, data, options = {}) => {
  return request(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const put = (url, data, options = {}) => {
  return request(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const del = (url, options = {}) => {
  return request(url, { ...options, method: "DELETE" });
};
