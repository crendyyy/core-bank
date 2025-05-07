import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const useAxios = () => {
  const BASE_URL = '/api'

  const token = localStorage.getItem("token");

  const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

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