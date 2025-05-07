import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Tooltip, Divider, Typography } from "antd";
import { 
  DashboardOutlined, 
  DashboardFilled, 
  BookOutlined, 
  BookFilled, 
  PieChartOutlined, 
  PieChartFilled,
  LogoutOutlined,
  BankOutlined,
  BankFilled,
  UserAddOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";

const primaryColor = "#FF6B35";
const secondaryColor = "#004E89";
const accentColor = "#38B2AC";
const textPrimary = "#333333";
const textSecondary = "#6C6F93";
const gradientPrimary = `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`;

const SidebarContainer = styled.div`
  height: 100vh;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  width: ${props => props.collapse ? "80px" : "100%"};
  position: relative;
  z-index: 10;
`;

const Logo = styled.div`
  padding: 20px;
  text-align: center;
  background: ${gradientPrimary};
  color: white;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapse ? "center" : "flex-start"};
`;

const LogoText = styled(Typography.Title)`
  margin: 0 !important;
  color: white !important;
  font-weight: 600 !important;
  white-space: nowrap;
`;

const StyledMenu = styled(Menu)`
  border-right: none !important;
  
  .ant-menu-item {
    margin: 10px 0;
    border-radius: ${props => props.collapse ? "0" : "0 25px 25px 0"};
    margin-right: ${props => props.collapse ? "0" : "20px"};
  }
  
  .ant-menu-item-selected, .ant-menu-submenu-selected > .ant-menu-submenu-title {
    background: ${gradientPrimary} !important;
    color: white !important;
  }
  
  .ant-menu-submenu-title:hover,
  .ant-menu-item:hover {
    color: ${primaryColor} !important;
  }
  
  .ant-menu-item-selected .ant-menu-item-icon,
  .ant-menu-submenu-selected > .ant-menu-submenu-title .ant-menu-item-icon {
    color: white !important;
  }
  
  .ant-menu-item-icon {
    font-size: 18px !important;
  }
  
  .ant-menu-submenu-title {
    font-weight: 500;
  }
  
  .ant-menu-item-group-title {
    color: ${textSecondary};
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 24px 16px 8px !important;
  }
`;

const LogoutButton = styled.div`
  margin-top: auto;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${textPrimary};
  border-top: 1px solid #f0f0f0;
  
  &:hover {
    color: ${primaryColor};
    background-color: rgba(255, 107, 53, 0.05);
  }
  
  .icon {
    font-size: 18px;
    margin-right: ${props => props.collapse ? "0" : "12px"};
  }
  
  .text {
    font-weight: 500;
    white-space: nowrap;
  }
`;

const Sidebar = ({ collapse }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCifActive = currentPath.includes("/cif") || currentPath.includes("/create-cif");
  const isDashboardActive = currentPath === "/";
  const isTabunganActive = currentPath.includes("/tabungan");
  const isPinjamanActive = currentPath.includes("/pinjaman");
  
  const items = [
    {
      key: "platforms",
      label: "PLATFORMS",
      type: "group",
      children: [
        {
          key: "cif",
          label: "CIF",
          icon: isCifActive ? <UserOutlined style={{ color: isCifActive ? "white" : primaryColor }} /> : <UserOutlined style={{ color: textPrimary }} />,
          children: [
            {
              key: "/create-cif",
              label: "Tambah CIF",
              icon: <UserAddOutlined />,
              onClick: () => navigate("/create-cif"),
            },
          ],
        },
      ],
    },
    {
      key: "projects",
      label: "PROJECTS",
      type: "group",
      children: [
        {
          key: "/dashboard",
          label: "Dashboard",
          icon: isDashboardActive ? <DashboardFilled style={{ color: isDashboardActive ? "white" : primaryColor }} /> : <DashboardOutlined style={{ color: textPrimary }} />,
          onClick: () => navigate("/dashboard"),
        },
        {
          key: "/tabungan",
          label: "Tabungan",
          icon: isTabunganActive ? <BankFilled style={{ color: isTabunganActive ? "white" : primaryColor }} /> : <BankOutlined style={{ color: textPrimary }} />,
          onClick: () => navigate("/tabungan"),
        },
        {
          key: "/pinjaman",
          label: "Pinjaman",
          icon: isPinjamanActive ? <PieChartFilled style={{ color: isPinjamanActive ? "white" : primaryColor }} /> : <PieChartOutlined style={{ color: textPrimary }} />,
          onClick: () => navigate("/pinjaman"),
        },
      ],
    },
  ];

  const logout = () => {
    queryClient.clear();
    localStorage.removeItem("token");
    navigate("/");
  };
  
  const getMenuItems = (items) => {
    return items.map(item => {
      if (item.type === "group") {
        return {
          type: "group",
          label: collapse ? null : item.label,
          key: item.key,
          children: getMenuItems(item.children),
        };
      }
      
      if (item.children) {
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: getMenuItems(item.children),
          onClick: item.onClick,
        };
      }
      
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: item.onClick,
      };
    });
  };

  return (
    <SidebarContainer $collapse={collapse}>
      <Logo $collapse={collapse}>
        {collapse ? (
          <LogoText level={4}>SGP</LogoText>
        ) : (
          <LogoText level={4}>SisGadai Pro</LogoText>
        )}
      </Logo>
      
      <StyledMenu
        mode="inline"
        theme="light"
        defaultSelectedKeys={[currentPath]}
        defaultOpenKeys={collapse ? [] : ["platforms", "cif", "projects"]}
        inlineCollapsed={collapse}
        items={getMenuItems(items)}
      />
      
      <Tooltip title={collapse ? "Sign out" : ""} placement="right">
        <LogoutButton onClick={logout} $collapse={collapse}>
          <LogoutOutlined className="icon" style={{ color: secondaryColor }} />
          {!collapse && <span className="text">Sign out</span>}
        </LogoutButton>
      </Tooltip>
    </SidebarContainer>
  );
};

export default Sidebar;