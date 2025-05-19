import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import rolesKeys from ".";
// import useLoadingToast from "../../../../hooks/useToast";

export const useDeleteRoles = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
//   const toast = useLoadingToast();

  return useMutation({
    mutationFn: (id) => {
    //   toast.loading("Deleting user...");
      return axiosClient._delete(`/api/v1/Roles/${id}`);
    },

    onSuccess: (response) => {
    //   toast.update("User deleted successfully.", "success");
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists });
    },

    onError: () => {
    //   toast.update("Failed to delete user, please try again", "error");
    },
  });
};