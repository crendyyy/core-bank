import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
  theme,
  Tooltip,
  Typography,
} from "antd";
import LoginPage from "../pages/LoginPage";
import Laporan from "../pages/Laporan";
import Sider from "antd/es/layout/Sider";
import { Header } from "antd/es/layout/layout";
import CreateCif from "../pages/CreateCif";
import InformasiDeposito from "../pages/InformasiDeposito";
import ViewJurnal from "../pages/ViewJurnal";
import Konfigurasi from "../pages/Konfigurasi";
import Sidebar from "../components/shared/Aside";
import Tabungan from "../pages/Tabungan";
import Pinjaman from "../pages/Pinjaman";
import ProtectedRoutes from "./ProtectedRoutes";
import { useGetJabatan } from "../service/userServices/useGetJabatan";
import { UserProvider, useUserContext } from "../components/context/userContext";

const LayoutPage = () => {
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useUserContext();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
      <Sider trigger={null} collapsible collapsed={collapsed} width={280}>
        <Sidebar collapse={collapsed} />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0px 16px 0 16px",
            background: colorBgContainer,
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
              marginRight: "24px",
            }}
          >
            <Space size={12} align="center">
              {!user?.limit && (
                <Tooltip title="Limit User">
                  <div
                    style={{
                      padding: "0px 10px",
                      backgroundColor: "rgba(34, 131, 248, 0.1)",
                      border: `1px solid #2283F8 20`,
                      height: "40px ",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
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
                  <div
                    style={{
                      padding: "4px 10px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "20px",
                      height: "40px ",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
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
        <main className="p-10 bg-white m-6 rounded-lg">
          <Outlet />
        </main>
      </Layout>
    </Layout>
  );
};

const routes = [
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    element: <Outlet />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <LayoutPage />
          </ProtectedRoutes>
        ),
        children: [
          {
            path: "/laporan",
            children: [{ index: true, element: <Laporan /> }],
          },
          {
            path: "/informasi-tabungan",
            children: [{ index: true, element: <Tabungan /> }],
          },
          {
            path: "/informasi-pinjaman",
            children: [{ index: true, element: <Pinjaman /> }],
          },
          {
            path: "/create-cif",
            children: [{ index: true, element: <CreateCif /> }],
          },
          {
            path: "/informasi-deposito",
            children: [{ index: true, element: <InformasiDeposito /> }],
          },
          {
            path: "/view-jurnal",
            children: [{ index: true, element: <ViewJurnal /> }],
          },
          {
            path: "/konfigurasi",
            children: [{ index: true, element: <Konfigurasi /> }],
          },
        ],
      },
    ],
  },
];

export default routes;
