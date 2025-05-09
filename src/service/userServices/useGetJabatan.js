import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import userKeys from ".";

export const useGetJabatan = (kdPos) => {
  const axiosClient = useAxios();

  const cacheKey = userKeys.detailJabatan(kdPos);

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/jabatan/${kdPos}`),
  });

  return { ...query, data: query.data?.data };
};