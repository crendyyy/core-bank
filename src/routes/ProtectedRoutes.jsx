
import { Spin } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoutes = ({ roles, children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  if (!token) {
    return  null; 
  }

  return children;
};

export default ProtectedRoutes;

// import PropTypes from "prop-types";
// import { Navigate } from "react-router-dom";
// import { useGetProfile } from "../components/service/user/userService";
// import { Spin } from "antd";
// import { useGetCurrentUser } from "../service/userServices/userService";

// const ProtectedRoute = ({ roles, children }) => {
//   const { data: user, isPending } = useGetCurrentUser();
//   const allowedRoles = new Set(roles);

//   let isUserAllowed = false;

//   if (Array.isArray(user?.data?.roleId)) {
//     isUserAllowed = user.data.roleId.some((roleId) => allowedRoles.has(roleId));
//   }

//   if (isPending) {
//     return <Spin/>; 
//   }

//   if (!user?.success || !isUserAllowed) {
//     return <Navigate to="/*" replace />; 
//   }

//   return children;
// };

// // ProtectedRoute.propTypes = {
// //   roles: PropTypes.array.isRequired,
// //   children: PropTypes.node.isRequired,
// // };

// export default ProtectedRoute;