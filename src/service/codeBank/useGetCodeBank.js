import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import codeBankKeys from ".";
import useAxios from "../../hooks/useHooks";

export const useGetCodeBank = () => {
  const axiosClient = useAxios();

  const cacheKey = codeBankKeys.lists;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/Login/GetKantor`),
  });

  return { ...query, data: query.data?.data };
};

export const useGetBranch = () => {
  const axiosClient = useAxios();

  const cacheKey = codeBankKeys.listscodeBranch;

  const query = useQuery({
    queryKey: cacheKey,
    staleTime: Infinity,
    queryFn: () => axiosClient._get(`/User/GetHakAkses`),
  });

  return { ...query, data: query.data?.data };
};