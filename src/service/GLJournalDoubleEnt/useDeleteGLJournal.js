import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import useLoadingToast from "../../hooks/useToast";
import GLDoubleEntKeys from ".";

export const useDeleteGLDoubleEntry = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (id) => {
      toast.loading("Delete GLDoubleEntry....");
      return axiosClient._delete(`/GlDoubleEntry/DeleteGlJournal/${id}`);
    },

    onSuccess: (response) => {
      toast.update("GLDoubleEntry Delete successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: GLDoubleEntKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};