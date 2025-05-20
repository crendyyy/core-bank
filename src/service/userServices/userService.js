import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const cacheKey = userKeys.currentUser;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => axiosClient._get("/api/v1/User/GetCurrentUser"),
  });

  return { ...query, data: query.data?.data };
};

export const useUserValidasi = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  //   const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      //   toast.loading("Create owner....");
      return axiosClient._post(`/api/v1/Login/Validasi`, data);
    },

    onSuccess: (response) => {
      //   toast.update("Owner create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: userKeys.validasiUser });
    },

    onError: () => {
      //   toast.update("Failed to create owner, please try again", "error");
    },
  });
};
