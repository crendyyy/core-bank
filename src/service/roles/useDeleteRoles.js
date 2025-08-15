import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import rolesKeys from ".";
import useLoadingToast from "../../hooks/useToast";

export const useDeleteRoles = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (id) => {
      toast.loading("Deleting Role...");
      return axiosClient._delete(`/Roles/${id}`);
    },

    onSuccess: (response) => {
      toast.update("Role deleted successfully.", "success");
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists });
    },

    onError: () => {
      toast.update("Failed to delete Role, please try again", "error");
    },
  });
};