export const menuConfig = [
    {
      type: "group",
      key: "Menu",
      label: "Menu",
      children: [
        {
          key: "cif",
          label: "CIF",
          icon: "UserOutlined",
          activeIcon: "UserOutlined",
          pathMatch: ["/cif", "/create-cif"],
          children: [
            {
              key: "/create-cif",
              label: "Tambah CIF",
              icon: "UserAddOutlined",
              path: "/create-cif"
            }
          ]
        },
        {
          key: "tabunganMenu",
          label: "Tabungan",
          icon: "BookOutlined",
          activeIcon: "BookOutlined",
          pathMatch: ["/tabunganMenu", "/informasi-tabungan"],
          children: [
            {
              key: "/informasi-tabungan",
              label: "Informasi Tabungan",
              icon: "BankOutlined",
              activeIcon: "BankFilled",
              path: "/informasi-tabungan"
            }
          ]
        },
        {
          key: "depositoMenu",
          label: "Deposito",
          icon: "GoldOutlined",
          activeIcon: "GoldOutlined",
          pathMatch: ["/depositoMenu", "/informasi-deposito"],
          children: [
            {
              key: "/informasi-deposito",
              label: "Informasi Deposito",
              icon: "GoldOutlined",
              activeIcon: "GoldFilled",
              path: "/informasi-deposito"
            }
          ]
        },
        {
          key: "pinjamanMenu",
          label: "Pinjaman",
          icon: "TransactionOutlined",
          activeIcon: "TransactionOutlined",
          pathMatch: ["/pinjamanMenu", "/informasi-pinjaman"],
          children: [
            {
              key: "/informasi-pinjaman",
              label: "Informasi Pinjaman",
              icon: "PieChartOutlined",
              activeIcon: "PieChartFilled",
              path: "/informasi-pinjaman"
            }
          ]
        },
        {
          key: "generalLedgerMenu",
          label: "General Ledger",
          icon: "FileTextOutlined",
          activeIcon: "FileTextOutlined",
          pathMatch: ["/generalLedgerMenu", "/view-jurnal"],
          children: [
            {
              key: "/view-jurnal",
              label: "View Jurnal",
              icon: "FileTextOutlined",
              activeIcon: "FileTextFilled",
              path: "/view-jurnal"
            }
          ]
        },
        {
          key: "/laporan",
          label: "Laporan",
          icon: "FileDoneOutlined",
          activeIcon: "FileDoneOutlined",
          pathMatch: ["/laporan"],
          path: "/laporan"
        }
      ]
    },
    {
      type: "group",
      key: "konfigurasi",
      label: "Konfigurasi",
      children: [
        {
          key: "/konfigurasi",
          label: "Konfigurasi",
          icon: "SettingOutlined",
          activeIcon: "SettingFilled",
          pathMatch: ["/konfigurasi"],
          path: "/konfigurasi"
        }
      ]
    }
  ];