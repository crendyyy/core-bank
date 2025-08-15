import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import useLoadingToast from "../../hooks/useToast";
import GLDoubleEntKeys from ".";

export const useUpdateGLDoubleEntry = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({id, data}) => {
      toast.loading("Update GLDoubleEntry....");
      return axiosClient._patch(`/GlDoubleEntry/UpdateGlJournal/${id}`, data);
    },

    onSuccess: (response) => {
      toast.update("GLDoubleEntry Update successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: GLDoubleEntKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};

export const usePostingGLDoubleEntry = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (id) => {
      // toast.loading("Posting GLDoubleEntry....");
      return axiosClient._patch(`/GlDoubleEntry/PostingGlJournal/${id}`);
    },

    onSuccess: (response) => {
      // toast.update("GLDoubleEntry Posting successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: GLDoubleEntKeys.lists });
    },

    onError: (response) => {
      // toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};