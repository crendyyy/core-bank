import { useQueryClient } from "@tanstack/react-query";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../components/context/userContext";
import { useNavigation } from "../components/context/NavigationContext";

const NotFound = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUser } = useUserContext();
  const { setNavigation } = useNavigation();
  const handleBack = () => {
    queryClient.clear();
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };
  return (
    <main className="flex flex-col items-center justify-center h-screen z-90">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button onClick={handleBack} type="primary">
            Back to login page
          </Button>
        }
      />
    </main>
  );
};
export default NotFound;
