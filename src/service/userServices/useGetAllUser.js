import { useQuery } from "@tanstack/react-query";
import userKeys from ".";
import useAxios from "../../hooks/useHooks";

export const useGetAllUser = () => {
  const axiosClient = useAxios();

  const cacheKey = userKeys.listsUser;

  const query = useQuery({
    queryKey: cacheKey,
    staleTime: Infinity,
    queryFn: () => axiosClient._get(`/api/v1/User/GetAllUser`),
  });

  return { ...query, data: query.data?.data };
};