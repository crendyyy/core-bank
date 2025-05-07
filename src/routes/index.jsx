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
import { Button, Layout, Menu, theme } from "antd";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Sider from "antd/es/layout/Sider";
import { Header } from "antd/es/layout/layout";
import CreateCif from "../pages/CreateCif";
import Sidebar from "../components/shared/Aside";
import Tabungan from "../pages/Tabungan";
import Pinjaman from "../pages/Pinjaman";
import ProtectedRoutes from "./ProtectedRoutes";

const LayoutPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={280}>
        <Sidebar collapse={collapsed} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
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
            path: "/dashboard",
            children: [{ index: true, element: <Dashboard /> }],
          },
          {
            path: "/tabungan",
            children: [{ index: true, element: <Tabungan /> }],
          },
          {
            path: "/pinjaman",
            children: [{ index: true, element: <Pinjaman /> }],
          },
          {
            path: "/create-cif",
            children: [{ index: true, element: <CreateCif /> }],
          },
        ],
      },
    ],
  },
];

export default routes;
