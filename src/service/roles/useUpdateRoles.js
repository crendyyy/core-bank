import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import rolesKeys from ".";
import useLoadingToast from "../../hooks/useToast";

export const useUpdateRoles = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({ id, data }) => {
      toast.loading("Update Role....");
      return axiosClient._patch(`/api/v1/Roles/${id}`, data);
    },

    onSuccess: (response) => {
      toast.update("Role Update successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};
