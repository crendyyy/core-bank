import { use, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGetUserPermissions } from "../service/menus/useGetMenus";
import { useUserValidasi } from "../service/userServices/userService";
import { message } from "antd";
const usePermitValidation = ({ alwaysRequirePermit = false } = {}) => {
  const location = useLocation();
  const { data: userPermission } = useGetUserPermissions(location.pathname);
  const [messageApi, contextHolder] = message.useMessage();

  // State for tracking modals
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const validasiUserMutation = useUserValidasi();

  // State to track the current action being processed
  const [currentAction, setCurrentAction] = useState({
    type: null, // Action type identifier (e.g., 'add', 'edit', 'delete')
    actionName: null, // Permission name to check (e.g., 'CanCreate', 'CanDelete')
    data: null, // Any data needed to execute the action after validation
    onSuccess: null, // Callback function to execute on successful validation
  });

  // Check if user has a specific permission
  const checkPermission = (actionName) => {
    if (!userPermission?.data) return false;

    const permission = userPermission.data.find(
      (p) => p.actionName === actionName
    );

    return permission?.isAllowed || false;
  };

  // Handle permit validation before executing an action
  const validatePermission = ({
    type,
    actionName,
    data = null,
    onSuccess = null,
  }) => {
    // Store current action details
    setCurrentAction({
      type,
      actionName,
      data,
      onSuccess,
    });

    // Check if permit validation is required
    if (alwaysRequirePermit || !checkPermission(actionName)) {
      // Show permit modal
      setIsPermitModalOpen(true);
    } else {
      // User has permission, execute action directly
      if (onSuccess) {
        onSuccess(data);
      }
    }
  };

  // Handle permit modal submit
  const handlePermitSubmit = (value) => {
    validasiUserMutation.mutate(
      {
        UserID: value.userId,
        Password: value.password,
        route: location.pathname,
      },
      {
        onSuccess: (response) => {

          if (response.data.isAllowed) {
            if (currentAction.onSuccess) {
              currentAction.onSuccess(currentAction.data);
            }
            // Close the permit modal
            setIsPermitModalOpen(false);
          } else {
            messageApi.open({
              type: `error`,
              content: `${response.data.message}`
            });
          }
        },
        onError: () => {
          console.error("Error validating user");
        },
      }
    );
  };

  // Close the permit modal
  const closePermitModal = () => {
    setIsPermitModalOpen(false);
  };

  // Functions to control action modal (e.g., add, edit modal)
  const openActionModal = () => {
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
  };

  // Returns all necessary functions and state for permit validation
  return {
    // Permission checking
    checkPermission,
    validatePermission,

    // Permit modal state and handlers
    isPermitModalOpen,
    closePermitModal,
    handlePermitSubmit,

    // Action modal state and handlers
    isActionModalOpen,
    openActionModal,
    closeActionModal,

    currentAction,
    contextHolder,
    messageApi
    
  };
};

export default usePermitValidation;
