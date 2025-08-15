import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import useLoadingToast from "../../hooks/useToast";
import GLDoubleEntKeys from ".";

export const useCreateGLDoubleEntry = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      toast.loading("Create GLDoubleEntry....");
      return axiosClient._post(`/GlDoubleEntry/CreateGlJournal`, data);
    },

    onSuccess: (response) => {
      toast.update("GLDoubleEntry create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: GLDoubleEntKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};