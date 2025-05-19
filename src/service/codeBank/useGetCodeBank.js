import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import codeBankKeys from ".";
import useAxios from "../../hooks/useHooks";

export const useGetCodeBank = () => {
  const axiosClient = useAxios();

  const cacheKey = codeBankKeys.lists;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/api/v1/Login/GetKantor`),
  });

  return { ...query, data: query.data?.data };
};