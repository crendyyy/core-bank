import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import rolesKeys from ".";
import useLoadingToast from "../../hooks/useToast";

export const useCreateRoles = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      toast.loading("Create Role....");
      return axiosClient._post(`/Roles`, data);
    },

    onSuccess: (response) => {
      toast.update("Role create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};