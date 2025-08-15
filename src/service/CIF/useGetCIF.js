import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import cifKeys from ".";

export const useGetAllCIF = () => {
  const axiosClient = useAxios();

  const cacheKey = cifKeys.lists;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/CIF/GetCIF`),
  });

  return { ...query, data: query.data?.data };
};

export const useGetCIF = (params = {}) => {
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
      ? cifKeys.lists
      : cifKeys.list(params);

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () =>
      axiosClient._get(
        `/CIF/GetCIF?${queryParams.toString()}`
      ),
  });

  return { ...query, data: query.data?.data };
};

export const useGetAllSelectCIF = () => {
  const axiosClient = useAxios();

  const cacheKey = cifKeys.listsSelectCIF;

  const query = useQuery({
    queryKey: cacheKey,
    staleTime: Infinity,
    queryFn: () => axiosClient._get(`/CIF/GetSelectCIF`),
  });

  return { ...query, data: query.data?.data };
};