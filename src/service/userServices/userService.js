import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import userKeys from ".";

export const useLogin = () => {
    const axiosClient = useAxios();
  
    return useMutation({
      mutationFn: (credentials) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        return axiosClient._post("/api/v1/login/login", credentials, config, {
          withCredentials: true,
        });
      },
    });
  };

  export const useGetCurrentUser = () => {
  const axiosClient = useAxios();
  const cacheKey = userKeys.currentUser

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get("/api/v1/User/GetCurrentUser"),
  });

  return { ...query, data: query.data?.data };
};