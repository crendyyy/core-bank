import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import PinjamanKeys from ".";

export const useGetKreditSetup = (kdProduk) => {
  const axiosClient = useAxios();

  const cacheKey = PinjamanKeys.KreSetup(kdProduk);

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () =>
      axiosClient._get(`/Pinjaman/GetKreditSetup?kdProduk=${kdProduk}`),
    enabled: !!kdProduk, // Only run query when kdProduk is available
  });

  return { ...query, data: query.data?.data };
};
