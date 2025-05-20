import { lazy, Suspense, useState } from "react";
import { Outlet, useLocation, useRoutes } from "react-router-dom";
import Aside from "../components/shared/Aside";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Layout,
  Menu,
  Space,
  Spin,
  theme,
  Tooltip,
  Typography,
} from "antd";
import LoginPage from "../pages/LoginPage";
import Sider from "antd/es/layout/Sider";
import { Header } from "antd/es/layout/layout";
import Sidebar from "../components/shared/Aside";
import ProtectedRoutes from "./ProtectedRoutes";
import {
  UserProvider,
  useUserContext,
} from "../components/context/userContext";
import { useGetUserNavigation } from "../service/menus/useGetMenus";
import { useNavigation } from "../components/context/NavigationContext";
import NotFound from "../pages/NotFoundPages";
import { Bounce, ToastContainer } from "react-toastify";

const LayoutPage = () => {
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useUserContext();
  const { setNavigation } = useNavigation();

  const { Text } = Typography;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        className="!bg-white"
      >
        <Sidebar collapse={collapsed} />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0px 16px 0 16px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            className="flex items-center justify-center p-0 border-0 hover:bg-blue-50"
            onClick={() => setCollapsed(!collapsed)}
            icon={
              collapsed ? (
                <MenuUnfoldOutlined
                  style={{ fontSize: "18px", color: "#2283F8" }}
                />
              ) : (
                <MenuFoldOutlined
                  style={{ fontSize: "18px", color: "#2283F8" }}
                />
              )
            }
          />
          <div className="flex items-center ml-auto mr-6">
            <Space size={12} align="center">
              {user?.limit !== undefined && (
                <Tooltip title="Limit User">
                  <div className="py-0 px-2.5 bg-blue-100 border border-solid border-primary h-10 rounded-3xl flex items-center gap-2">
                    <span className="text-primary text-xs font-medium whitespace-nowrap">
                      Limit User
                    </span>
                    <div className="h-4 w-px bg-blue-300"></div>
                    <Text
                      style={{
                        fontSize: "13px",
                        color: "#2283F8",
                        fontWeight: 500,
                      }}
                    >
                      {formatRupiah(user?.limit)}
                    </Text>
                  </div>
                </Tooltip>
              )}

              {user?.kdposisi && (
                <Tooltip title="Jabatan">
                  <div className="py-1 px-2.5 bg-[#f5f5f5] rounded-[20px] h-10 flex items-center">
                    <Text
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontWeight: 500,
                      }}
                    >
                      {user?.kdposisi}
                    </Text>
                  </div>
                </Tooltip>
              )}

              <Divider
                type="vertical"
                style={{ height: "24px", margin: "0 8px" }}
              />

              <Space>
                <Avatar
                  style={{
                    backgroundColor: "#2283F8",
                    border: "2px solid white",
                    boxShadow: "0 2px 6px rgba(34, 131, 248, 0.2)",
                  }}
                  icon={<UserOutlined />}
                  size="default"
                />
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    background: user?.nama
                      ? `linear-gradient(90deg, #2283F8 30%, #0C4A8C 100%)`
                      : "none",
                    WebkitBackgroundClip: user?.nama ? "text" : "none",
                    WebkitTextFillColor: user?.nama ? "transparent" : "inherit",
                  }}
                >
                  {user?.nama || "Guest"}
                </Text>
              </Space>
            </Space>
          </div>
        </Header>
        <main className="m-6">
          <Outlet />
        </main>
      </Layout>
    </Layout>
  );
};
const toComponentName = (menuName) => menuName.replace(/\s/g, "");

const DynamicRoutes = () => {
  const { navigation } = useNavigation();

  const dynamicChildren = navigation.flatMap((group) =>
    group.menus.map((menu) => {
      const Component = lazy(() =>
        import(`../pages/${toComponentName(menu.menuName)}.jsx`)
      );
      const LazyWrapper = ({ Component }) => (
        <Suspense fallback={<Spin />}>
          <Component />
        </Suspense>
      );

      return {
        path: menu.route,
        element: <LazyWrapper key={menu.route} Component={Component} />,
      };
    })
  );

  const routes = [
    {
      path: "/",
      element: (
        <>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            draggable={true}
            transition={Bounce}
            pauseOnHover={false}
          />
          <LoginPage />,
        </>
      ),
    },
    {
      element: <Outlet />,
      children: [
        {
          path: "/",
          element: (
            <ProtectedRoutes>
              <ToastContainer
                position="top-right"
                autoClose={2000}
                draggable={true}
                transition={Bounce}
                pauseOnHover={false}
              />
              <LayoutPage />
            </ProtectedRoutes>
          ),
          children: dynamicChildren,
        },
      ],
    },
    //  {
    //   path: "*",
    //   element: <NotFound />,
    // },
  ];

  return useRoutes(routes);
};

export default DynamicRoutes;
