import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const useAxios = () => {
  const BASE_URL = '/api'
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  
  axiosClient.interceptors.request.use((config) => {
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
    (response) => response, 
    (error) => {
      if (error.response?.status === 401) {
        queryClient.clear();
        navigate("/");
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