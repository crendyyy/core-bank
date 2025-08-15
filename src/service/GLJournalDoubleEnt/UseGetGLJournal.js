import { useQuery } from "@tanstack/react-query";
import GLDoubleEntKeys from ".";
import useAxios from "../../hooks/useHooks";

export const useGetAllGLDoubleEntry = (params = {}) => {
  const axiosClient = useAxios();

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // If the value is an array, append each item separately
      value.forEach((v) => queryParams.append(key, v));
    } else if (value !== undefined && value !== null) {
      // For non-array values
      queryParams.append(key, value);
    }
  });


  const cacheKey =
    Object.keys(params).length === 0
      ? GLDoubleEntKeys.lists
      : GLDoubleEntKeys.list(params);

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/GlDoubleEntry/GetAllGlJournals?${queryParams.toString()}`),
  });

  return { ...query, data: query.data?.data };
};

export const useGetAllCoa = () => {
  const axiosClient = useAxios();

  const cacheKey = GLDoubleEntKeys.listsCoa;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/GlDoubleEntry/GetAllCoa`),
  });

  return { ...query, data: query.data?.data };
};
