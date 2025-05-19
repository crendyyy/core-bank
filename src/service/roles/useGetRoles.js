import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import rolesKeys from ".";

export const useGetRoles = () => {
  const axiosClient = useAxios();

  const cacheKey = rolesKeys.lists;

  const query = useQuery({
    queryKey: cacheKey,
    staleTime: Infinity,
    queryFn: () => axiosClient._get(`/api/v1/Roles`),
  });

  return { ...query, data: query.data?.data };
};

export const useGetRolesAction = () => {
  const axiosClient = useAxios();

  const cacheKey = rolesKeys.listsRolesAction;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/api/v1/User/GetActions`),
  });

  return { ...query, data: query.data?.data };
};