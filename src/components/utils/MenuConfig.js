import { FileOutlined } from "@ant-design/icons";

export function mapMenusToMenuConfig(dataMenus) {
  if (!dataMenus) return [];

  const iconMap = {
    CIF: "UserOutlined",
    Tabungan: "WalletOutlined",
    Deposito: "BankOutlined",
    Pinjaman: "CreditCardOutlined",
    "General Ledger": "BookOutlined",
    "Laporan Transaksi": "FileTextOutlined",
    Laporan: "BarChartOutlined",
    "Hak Akses Menu": "SettingOutlined",
  };

  const menuChildren = [];
  const konfigurasiChildren = [];

  dataMenus.forEach((group) => {
    const iconName = iconMap[group.groupName] || "FileOutlined";
    const pathMatch = group.menus.map((menu) => menu.route);

    const transformedGroup = {
      key: group.groupName.toLowerCase().replace(/\s+/g, "-"),
      label: group.groupName.toUpperCase(),
      icon: iconName,
      activeIcon: iconName,
      pathMatch,
      children: group.menus.map((menu) => ({
        key: menu.route,
        label: menu.menuName,
        path: menu.route,
        ...menu, // menyimpan detail permissions dan lainnya
      })),
    };

    if (group.groupName === "Hak Akses Menu") {
      konfigurasiChildren.push(transformedGroup);
    } else {
      menuChildren.push(transformedGroup);
    }
  });

  return [
    {
      type: "group",
      key: "Menu",
      label: "Menu",
      children: menuChildren,
    },
    ...(konfigurasiChildren.length
      ? [
          {
            type: "group",
            key: "konfigurasi",
            label: "Konfigurasi",
            children: konfigurasiChildren,
          },
        ]
      : []),
  ];
}
