import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import userKeys from ".";
// import useLoadingToast from "../../../../hooks/useToast";

export const useAssignRolesUser = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
//   const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
    //   toast.loading("Create owner....");
      return axiosClient._post(`/api/v1/User/AssignRole`, data);
    },

    onSuccess: (response) => {
    //   toast.update("Owner create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: userKeys.listsUser });
    },

    onError: () => {
    //   toast.update("Failed to create owner, please try again", "error");
    },
  });
};