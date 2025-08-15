import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import userKeys from ".";
import useLoadingToast from "../../hooks/useToast";

export const useAssignRolesUser = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      toast.loading("Assign Role User....");
      return axiosClient._post(`/User/AssignRole`, data);
    },

    onSuccess: (response) => {
      toast.update("Role User Assign successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: userKeys.listsUser });
    },

     onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};