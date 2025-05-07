import { useLocation, useNavigate } from "react-router-dom";
import { Flex, Menu } from "antd";
import {
  BookFilled,
  BookOutlined,
  CodeOutlined,
  DashboardFilled,
  DashboardOutlined,
  LogoutOutlined,
  PieChartFilled,
  PieChartOutlined,
} from "@ant-design/icons";

//Aside.jsx
const Sidebar = ({collapse}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    {
      key: "platforms",
      label: (
        <span className="text-xs font-bold uppercase text-black/50">
          Platforms
        </span>
      ),
      type: "group",
      children: [
        {
          key: "cif",
          label: "CIF",
          icon: <CodeOutlined />,
          children: [
            {
              key: "/create-cif",
              label: <span>Tambah CIF</span>,
              onClick: () => navigate("/create-cif"),
            },
          ],
        },
      ],
    },
    {
      key: "projects",
      label: (
        <span className="text-xs font-bold uppercase text-black/50">
          Projects
        </span>
      ),
      type: "group",
      children: [
        {
          key: "/",
          label: "Dashboard",
          icon: <DashboardOutlined className="text-xl" />,
          onClick: () => navigate("/"),
        },
        {
          key: "/tabungan",
          label: "Tabungan",
          icon: <PieChartOutlined className="text-xl" />,
          onClick: () => navigate("/tabungan"),
        },
        {
          key: "/pinjaman",
          label: "Pinjaman",
          icon: <BookOutlined className="text-xl" />,
          onClick: () => navigate("/pinjaman"),
        },
      ],
    },
  ];

  return (
    <aside className="bg-white">
      <div className="flex flex-col justify-between h-screen p-4">
        <Flex vertical gap={20}>
          <Menu
            mode="inline"
            items={items}
            selectedKeys={[location.pathname]}
            onClick={({ key }) => {
              const selectedItem = items.find((item) => item.key === key);
              if (selectedItem?.onClick) {
                selectedItem.onClick();
              }
            }}
            defaultOpenKeys={["platforms", "project", "vessel"]}
          />
        </Flex>
      </div>
    </aside>
  );
};

export default Sidebar;
