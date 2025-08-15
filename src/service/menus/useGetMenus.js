import { useQuery } from "@tanstack/react-query";
import menusKeys from ".";
import useAxios from "../../hooks/useHooks";

export const useGetAllMenus = () => {
  const axiosClient = useAxios();

  const cacheKey = menusKeys.listsMenus;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/User/GetAllMenus`),
  });

  return { ...query, data: query.data?.data };
};

export const useGetUserMenusByModule = () => {
  const axiosClient = useAxios();

  const cacheKey = menusKeys.listsMenusByModule;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/User/GetUserMenusByModule`),
  });

  return { ...query, data: query.data?.data };
};

export const useGetUserPermissions = (route) => {
  const axiosClient = useAxios();

  const cacheKey = menusKeys.DetailUserMenus(route);

  const query = useQuery({
    queryKey: cacheKey,
    staleTime: Infinity,
    queryFn: () => axiosClient._get(`/User/GetUserPermissions${route}`),
  });

  return { ...query, data: query.data?.data };
};

export const useGetUserNavigation = () => {
  const axiosClient = useAxios();

  const cacheKey = menusKeys.listsNavigations;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get(`/User/GetNavigation`),
  });

  return { ...query, data: query.data?.data };
};

export const fetchUserNavigation = async (axiosClient) => {
  const res = await axiosClient._get("/User/GetNavigation");
  return res.data; // sesuai dengan data: query.data?.data
};
