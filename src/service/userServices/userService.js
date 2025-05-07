import { useMutation } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";

export const useLogin = () => {
    const axiosClient = useAxios();
  
    return useMutation({
      mutationFn: (credentials) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        return axiosClient._post("/login/login", credentials, config, {
          withCredentials: true,
        });
      },
    });
  };