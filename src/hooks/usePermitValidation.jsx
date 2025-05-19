import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useGetUserPermissions } from "../service/menus/useGetMenus";

/**
 * Custom hook for handling permission validation across the application
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.alwaysRequirePermit - Whether this page always requires permit validation
 * @returns {Object} Permission checking utilities and state
 */
const usePermitValidation = ({ alwaysRequirePermit = false } = {}) => {
  const location = useLocation();
  const { data: userPermission } = useGetUserPermissions(location.pathname);

  // State for tracking modals
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  
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
    onSuccess = null
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
  const handlePermitSubmit = (values) => {
    // Here you would typically validate the user credentials with API
    // For now, we'll just assume validation is successful

    // Close the permit modal
    setIsPermitModalOpen(false);
    
    // Execute the action callback if provided
    if (currentAction.onSuccess) {
      currentAction.onSuccess(currentAction.data);
    }
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
    
    // Current action being processed
    currentAction,
  };
};

export default usePermitValidation;