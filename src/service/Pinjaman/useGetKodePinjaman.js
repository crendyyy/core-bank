import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import PinjamanKeys from ".";

export const useGetKodePinjaman = () => {
  const axiosClient = useAxios();

  const cacheKey = PinjamanKeys.listsKodePinjaman

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () =>
      axiosClient._get(`/Pinjaman/GetKodePinjaman`),
  });

  return { ...query, data: query.data?.data };
};
