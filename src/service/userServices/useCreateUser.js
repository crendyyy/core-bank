import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import userKeys from ".";
import useLoadingToast from "../../hooks/useToast";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      toast.loading("Create User....");
      return axiosClient._post(`/User/CreateUser`, data);
    },

    onSuccess: (response) => {
      toast.update("User Create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: userKeys.listsUser });
    },

     onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};