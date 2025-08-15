import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import PinjamanKeys from ".";

export const useGetDetailPinjaman = (noRekKredit, status, params = {}) => {
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

  const cacheKey = PinjamanKeys.DetailPinjaman(noRekKredit);

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () =>
      axiosClient._get(
        `/Pinjaman/GetKreditDetail/${noRekKredit}/${status}?${queryParams.toString()}`
      ),
    enabled: !!noRekKredit, // Only run query when noRekKredit is available
  });

  return { ...query, data: query.data?.data };
};
