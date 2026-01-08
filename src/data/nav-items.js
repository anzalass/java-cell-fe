export const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Yuk Jualan",
    url: "/dashboard/transaksi",
    icon: "university",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },

  {
    title: "Master Data",
    url: "",
    icon: "clipboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [
      {
        title: "Stok Voucher",
        url: "/dashboard/master-data/stok-voucher",
        icon: "userPen",
        shortcut: ["n", "n"],
      },

      {
        title: "Stok Sparepart",
        url: "/dashboard/master-data/stok-sparepart",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "Stok Aksesoris",
        url: "/dashboard/master-data/stok-aksesoris",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "List Downline",
        url: "/dashboard/master-data/list-downline",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "List Member",
        url: "/dashboard/master-data/list-member",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "Uang Keluar",
        url: "/dashboard/master-data/uang-keluar",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
    ],
  },
  {
    title: "Transaksi",
    url: "",
    icon: "clipboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [
      {
        title: "Grosir Voucher",
        url: "/dashboard/transaksi/voucher",
        icon: "userPen",
        shortcut: ["n", "n"],
      },

      {
        title: "Sparepart",
        url: "/dashboard/transaksi/sparepart",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "Aksesoris",
        url: "/dashboard/transaksi/aksesoris",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "Service",
        url: "/dashboard/transaksi/service",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "Jualan Harian",
        url: "/dashboard/transaksi/jualan",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
    ],
  },
  {
    title: "Barang Keluar",
    url: "",
    icon: "clipboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [
      {
        title: "Voucher",
        url: "/dashboard/transaksi/item-voucher",
        icon: "userPen",
        shortcut: ["n", "n"],
      },

      {
        title: "Sparepart",
        url: "/dashboard/transaksi/item-sparepart",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
      {
        title: "Aksesoris",
        url: "/dashboard/transaksi/item-acc",
        icon: "userPen",
        shortcut: ["n", "n"],
      },
    ],
  },
  {
    title: "Logs",
    url: "/dashboard/logs",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "User",
    url: "/dashboard/user",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
];
