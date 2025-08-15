import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import UserKeys from ".";
import useLoadingToast from "../../hooks/useToast";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({ id, data }) => {
      toast.loading("Update User....");
      return axiosClient._patch(`/User/UpdateUser/${id}`, data);
    },

    onSuccess: (response) => {
      toast.update("User Update successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: UserKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};
