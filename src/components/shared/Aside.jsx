import { useLocation, useNavigate } from "react-router-dom";
import { Flex, Menu, Tooltip, Typography } from "antd";
import * as Icons from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import sisGadaiLogo from "/sisgadaiLogo.ico";
import { mapMenusToMenuConfig } from "../utils/MenuConfig";
import { useUserContext } from "../context/userContext";
import { useGetUserMenusByModule } from "../../service/menus/useGetMenus";
import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "../context/NavigationContext";

const primaryColor = "#2283F8";
const secondaryColor = "#0C4A8C";
const accentColor = "#4DABF5";
const textPrimary = "#333333";
const textSecondary = "#6B7AAA";

const gradientStyle = {
  color: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`,
};
const { Text } = Typography;

const Sidebar = ({ collapse }) => {
  const [openKeys, setOpenKeys] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { setUser } = useUserContext();

  const { data: dataMenus } = useGetUserMenusByModule();

  const dynamicMenuConfig = useMemo(
    () => mapMenusToMenuConfig(dataMenus?.data),
    [dataMenus]
  );

  useEffect(() => {
    if (!collapse) {
      setOpenKeys(getAllGroupKeys(dynamicMenuConfig));
    } else {
      setOpenKeys([]);
    }
  }, [dynamicMenuConfig, collapse]);

  const isPathActive = (pathPatterns) => {
    if (!pathPatterns) return false;
    return pathPatterns.some((pattern) => currentPath.includes(pattern));
  };

  const getIcon = (iconName, isActive, color) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? (
      <IconComponent
        className={`text-[${isActive ? primaryColor : textPrimary}]`}
      />
    ) : null;
  };

  const buildMenuItems = (menuItems) => {
    return menuItems.map((item) => {
      const isActive = isPathActive(item.pathMatch);

      if (item.type === "group") {
        return {
          type: "group",
          label: collapse ? null : item.label,
          key: item.key,
          children: buildMenuItems(item.children),
        };
      }

      const baseItem = {
        key: item.key,
        label: item.label,
        icon: getIcon(
          isActive ? item.activeIcon || item.icon : item.icon,
          isActive
        ),
      };

      if (item.path) {
        baseItem.onClick = () => navigate(item.path);
      }

      if (item.children && item.children.length > 0) {
        baseItem.children = buildMenuItems(item.children);
      }

      return baseItem;
    });
  };

  const logout = () => {
    queryClient.clear();
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const menuClassName = `
    ant-menu-custom
    border-none
  `;

  const getAllGroupKeys = (items) => {
    return items.reduce((keys, item) => {
      keys.push(item.key);
      if (item.children) {
        keys = [...keys, ...getAllGroupKeys(item.children)];
      }
      return keys;
    }, []);
  };

  const defaultOpenKeys = collapse ? [] : getAllGroupKeys(dynamicMenuConfig);

  return (
    <div
      className={`h-full bg-white flex flex-col relative z-10 ${
        collapse ? "w-20" : "w-full"
      }`}
    >
      <div
        className={`text-center text-white h-[70px] flex items-center  ${
          collapse ? "justify-center" : "justify-start"
        } px-5`}
      >
        {collapse ? (
          <img src={sisGadaiLogo} alt="SisGadai Logo" className="h-8 w-8" />
        ) : (
          <Flex gap={6} align="center">
            <img src={sisGadaiLogo} alt="SisGadai Logo" className="h-8 w-8" />
            <Text
              strong
              style={{
                fontSize: "24px",
                fontWeight: "600",
                background: `linear-gradient(90deg, #2283F8 30%, #0C4A8C 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SisGadai Pro
            </Text>
          </Flex>
        )}
      </div>

      <Menu
        className="ant-menu-custom border-none bg-white"
        mode="inline"
        theme="light"
        defaultSelectedKeys={[currentPath]}
        // openKeys={openKeys}
        // onOpenChange={setOpenKeys}
        inlineCollapsed={collapse}
        items={buildMenuItems(dynamicMenuConfig)}
      />

      <Tooltip title={collapse ? "Sign out" : ""} placement="right">
        <div
          onClick={logout}
          className={`mt-auto p-4 flex items-center ${
            collapse ? "justify-center" : "justify-start"
          } cursor-pointer text-gray-800 border-t border-gray-100 hover:text-[#2283F8] hover:bg-blue-50 transition-colors duration-200`}
        >
          <Icons.LogoutOutlined
            className="text-lg"
            style={{
              color: secondaryColor,
              marginRight: collapse ? 0 : "12px",
            }}
          />
          {!collapse && (
            <span className="font-medium whitespace-nowrap">Sign out</span>
          )}
        </div>
      </Tooltip>
    </div>
  );
};

export default Sidebar;
