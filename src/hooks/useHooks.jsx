import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../components/context/userContext";
import { useNavigation } from "../components/context/NavigationContext";
const useAxios = () => {
  const BASE_URL = "/api";
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { setUser } = useUserContext();

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
    },
  });

  axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  });

  axiosClient.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const accessToken = localStorage.getItem("token");

          const res = await axios.post("/api/api/v1/Login/refresh-token", {
            refreshToken,
            accessToken
          });

          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;

          // Simpan token baru
          localStorage.setItem("token", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Update header permintaan asli dan retry
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);

        } catch (err) {
          processQueue(err, null);
          queryClient.clear();
          localStorage.clear();
          setUser(null);
          navigate("/");
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  const _get = (url, config = {}) => {
    return axiosClient.get(url, config);
  };

  const _post = (url, data = {}, config = {}) => {
    return axiosClient.post(url, data, config);
  };

  const _put = (url, data = {}, config = {}) => {
    return axiosClient.put(url, data, config);
  };

  const _patch = (url, data = {}, config = {}) => {
    return axiosClient.patch(url, data, config);
  };

  const _delete = (url, config = {}) => {
    return axiosClient.delete(url, config);
  };

  return { _get, _post, _put, _patch, _delete };
};

export default useAxios;
