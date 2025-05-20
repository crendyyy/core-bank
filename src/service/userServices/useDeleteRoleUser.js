import { useMutation, useQueryClient } from "@tanstack/react-query";
import userKeys from ".";
import useAxios from "../../hooks/useHooks";
import useLoadingToast from "../../hooks/useToast";

export const useDeleteRolesUser = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({ userId, roleId }) => {
      toast.loading("Deleting Role User...");
      return axiosClient._delete(`/api/v1/User/RemoveRole/${userId}/${roleId}`);
    },

    onSuccess: (response) => {
      toast.update("Role User deleted successfully.", "success");
      queryClient.invalidateQueries({ queryKey: userKeys.listsUser });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};
