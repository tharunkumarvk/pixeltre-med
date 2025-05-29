import axios from "axios";

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const instance = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    if (["post", "put", "patch", "delete"].includes(config.method)) {
      config.headers["X-CSRFToken"] = getCookie("csrftoken");
    }
    return config;
  },
  error => Promise.reject(error)
);

export default instance;