import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import PinjamanKeys from ".";

export const useGetKreditRekening = (params = {}) => {
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
      ? PinjamanKeys.listsKreditRekening
      : PinjamanKeys.listKreditRekening(params);

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () =>
      axiosClient._get(
        `/Pinjaman/GetKreditRekening?${queryParams.toString()}`
      ),
  });

  return { ...query, data: query.data?.data };
};