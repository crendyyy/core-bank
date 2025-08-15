import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import rolesKeys from ".";
import useLoadingToast from "../../hooks/useToast";

export const useUpdateRolesAccess = (roleId) => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({id, data}) => {
      toast.loading("Create Role Access....");
      return axiosClient._post(`/Roles/${id}/access/bulk`, data);
    },

    onSuccess: (response) => {
      toast.update("Role Access create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: rolesKeys.detailRoleAccess(roleId) });
    },

   onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};