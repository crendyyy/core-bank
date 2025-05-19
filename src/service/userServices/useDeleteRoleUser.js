import { useMutation, useQueryClient } from "@tanstack/react-query";
import userKeys from ".";
import useAxios from "../../hooks/useHooks";
// import useLoadingToast from "../../../../hooks/useToast";

export const useDeleteRolesUser = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
//   const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({userId, roleId}) => {
    //   toast.loading("Deleting user...");
      return axiosClient._delete(`/api/v1/User/RemoveRole/${userId}/${roleId}`);
    },

    onSuccess: (response) => {
    //   toast.update("User deleted successfully.", "success");
      queryClient.invalidateQueries({ queryKey: userKeys.listsUser });
    },

    onError: () => {
    //   toast.update("Failed to delete user, please try again", "error");
    },
  });
};