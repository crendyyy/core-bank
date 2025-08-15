import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import rolesKeys from ".";

export const useGetRolesAccess = (roleId) => {
  const axiosClient = useAxios();

  const cacheKey = rolesKeys.detailRoleAccess(roleId);

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/Roles/${roleId}/access`),
    enabled: !!roleId,
  });

  return { ...query, data: query.data?.data };
};
