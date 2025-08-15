import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Modal,
  Input,
  Form,
  Tabs,
  Table,
  Tag,
  Space,
  Select,
  DatePicker,
  InputNumber,
  Typography,
  Descriptions,
  message,
  Row,
  Col,
  Flex,
  Drawer,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  PhoneOutlined,
  FileTextOutlined,
  MoreOutlined,
  FilterFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetAllSelectCIF, useGetCIF } from "../service/CIF/useGetCIF";
import {
  useCreateCIF,
  useCreateCIFDarurat,
  useCreateCIFPenjamin,
} from "../service/CIF/useCreateCIF";
import {
  useUpdateCIF,
  useUpdateCIFDarurat,
  useUpdateCIFPenjamin,
} from "../service/CIF/useUpdateCIF";
import {
  useDeleteCIF,
  useDeleteCIFDarurat,
  useDeleteCIFPenjamin,
} from "../service/CIF/useDeleteCIF";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const PendataanCIF = () => {
  const [isModalOpen, setIsModalOpen] = useState({
    IsCreate: false,
    IsEdit: false,
  });
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCIF, setSelectedCIF] = useState(null);
  const [formData] = Form.useForm();

  const searchInput = useRef(null);

  const [queryParams, setQueryParams] = useState({
    limit: 10,
    page: 1,
    sort: null,
    search: {
      start_date: null,
      end_date: null,
      kdBank: null,
      NoCIF: null,
      noKartuID: null,
      Nama: null,
      Alamat: null,
      jenisKelamin: null,
      namaIbuKandung: null,
      Karyawan: null,
      KeteranganTransaksi: null,
      All: null,
    },
  });

  const transformQueryParams = () => {
    const baseParams = {
      limit: queryParams.limit,
      page: queryParams.page,
    };

    // Handle sort parameters
    if (queryParams.sort) {
      baseParams[`sort[${queryParams.sort.field}]`] = queryParams.sort.order;
    }

    // Handle date range filtering - ensure mutual exclusivity
    if (queryParams.search.start_date || queryParams.search.end_date) {
      // If we're using date range, ensure 'date' is not included
      const { date, ...searchWithoutDate } = queryParams.search;

      // Handle all other search parameters dynamically
      Object.entries(searchWithoutDate).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle array values (like multiple filters)
          if (value.length > 0) {
            baseParams[`search[${key}]`] = value;
          }
        } else if (value !== null && value !== undefined && value !== "") {
          // Handle single values
          baseParams[`search[${key}]`] = dayjs.isDayjs(value)
            ? value.format("YYYY-MM-DD")
            : value;
        }
      });
    } else {
      // Handle all search parameters dynamically (including possible single date filter)
      Object.entries(queryParams.search).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle array values (like multiple filters)
          if (value.length > 0) {
            baseParams[`search[${key}]`] = value;
          }
        } else if (value !== null && value !== undefined && value !== "") {
          // Handle single values
          baseParams[`search[${key}]`] = dayjs.isDayjs(value)
            ? value.format("YYYY-MM-DD")
            : value;
        }
      });
    }

    return baseParams;
  };

  const { data, isPending } = useGetCIF(transformQueryParams());
  const createCIFMutation = useCreateCIF();
  const updateCIFMutation = useUpdateCIF();
  const deleteCIFMutation = useDeleteCIF();

  const cifData = data || [];

  // const filteredData = cifData.filter(
  //   (item) =>
  //     item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.noCIF?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.noKartuID?.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const handleCreate = () => {
    formData.resetFields();
    setIsModalOpen((prev) => ({ ...prev, IsCreate: true }));
  };

  const handleEdit = (cif) => {
    // Convert date strings to dayjs objects untuk DatePicker
    const formattedCif = {
      ...cif,
      tglReg: cif.tglReg ? dayjs(cif.tglReg) : null,
      tglLahir: cif.tglLahir ? dayjs(cif.tglLahir) : null,
      tglLahirPasangan: cif.tglLahirPasangan
        ? dayjs(cif.tglLahirPasangan)
        : null,
      tglLahirIbu: cif.tglLahirIbu ? dayjs(cif.tglLahirIbu) : null,
    };

    setSelectedCIF(cif);
    console.log("Selected CIF:", formattedCif);

    formData.setFieldsValue(formattedCif);
    setIsModalOpen((prev) => ({ ...prev, IsEdit: true }));
  };

  const handleDetail = (cif) => {
    setSelectedCIF(cif);
    setIsDetailOpen(true);
  };

  const handleDelete = async (noCIF) => {
    Modal.confirm({
      title: "Konfirmasi Hapus",
      content: "Apakah Anda yakin ingin menghapus data CIF ini?",
      onOk: async () => {
        try {
          await deleteCIFMutation.mutateAsync(noCIF);
          message.success("Data CIF berhasil dihapus");
        } catch (error) {
          message.error("Gagal menghapus data CIF");
        }
      },
    });
  };

  const handleSubmit = async (isEdit = false) => {
    console.log("Submitting form data:", formData.getFieldsValue());

    try {
      if (isEdit && selectedCIF) {
        await updateCIFMutation.mutateAsync({
          id: selectedCIF.noCIF,
          data: formData.getFieldsValue(),
        });
        setIsModalOpen((prev) => ({ ...prev, IsEdit: false }));
      } else {
        await createCIFMutation.mutateAsync(formData.getFieldsValue());
        setIsModalOpen((prev) => ({ ...prev, IsCreate: false }));
      }
      // message.success(`Data CIF berhasil ${isEdit ? "diupdate" : "dibuat"}`);
    } catch (error) {
      // message.error(`Gagal ${isEdit ? "mengupdate" : "membuat"} data CIF`);
    }
  };

  // FILTER
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setQueryParams((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        [dataIndex]: selectedKeys[0] || null,
      },
    }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setQueryParams((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        [dataIndex]: null,
      },
    }));
  };

  const getColumnSearchProps = (dataIndex) => {
    // Don't apply this to the date column
    if (dataIndex === "TglPengajuan") {
      return {}; // Return empty object for date column
    }

    // Regular search props for other columns
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }) => {
        return (
          <div
            style={{
              padding: 8,
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Input
              ref={searchInput}
              placeholder={`Cari ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() =>
                handleSearch(selectedKeys, confirm, dataIndex)
              }
              style={{
                padding: 6,
                marginBottom: 8,
                display: "block",
              }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{
                  width: 90,
                }}
              >
                Cari
              </Button>
              <Button
                onClick={() => {
                  clearFilters;
                  handleReset(clearFilters, dataIndex);
                  handleSearch([], confirm, dataIndex);
                }}
                size="small"
                style={{
                  width: 90,
                }}
              >
                Reset
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  close();
                }}
              >
                Tutup
              </Button>
            </Space>
          </div>
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? "#34A853" : undefined,
          }}
        />
      ),
      // onFilterDropdownOpenChange: (visible) => {
      //   if (visible) {
      //     setTimeout(() => searchInput.current?.select(), 100);
      //   }
      // },
      filterDropdownProps: {
        onOpenChange: (visible) => {
          if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        },
      },
    };
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // Preserve start_date and end_date when applying other filters
    const currentDateFilters = {
      start_date: queryParams.search.start_date,
      end_date: queryParams.search.end_date,
    };

    setQueryParams((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
      sort:
        sorter.field && sorter.order
          ? {
              field: sorter.field,
              order: sorter.order === "ascend" ? "asc" : "desc",
            }
          : null,
      search: {
        ...prev.search,
        ...currentDateFilters,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (key !== "TglPengajuan") {
            // Special handling for status to keep it as an array
            if (
              key === "kategori" ||
              (key === "status" && Array.isArray(value) && value.length > 0)
            ) {
              acc[key] = value; // Keep as array for status
            } else {
              acc[key] = value?.[0] || null; // Other filters use single value
            }
          }
          return acc;
        }, {}),
      },
    }));
  };

  return (
    <Card>
      {!isDetailOpen && (
        <>
          <div className="mb-4">
            <Title style={{ margin: 0 }} level={2}>
              Pendataan CIF
            </Title>
            <Text className="text-gray-500 mt-1">
              Kelola data CIF nasabah dengan sistem yang terintegrasi
            </Text>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 w-full mb-4">
            <Flex justify="space-between" align="center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Tambah CIF
              </Button>
              <Space>
                <Input.Search
                  placeholder="Cari berdasarkan Kode Bank, noCIF, Nama atau Alamat..."
                  allowClear
                  style={{ width: 400 }}
                  value={queryParams.search.All || ""}
                  onChange={(e) => {
                    setQueryParams((prev) => ({
                      ...prev,
                      search: {
                        ...prev.search,
                        All: e.target.value || null,
                      },
                    }));
                  }}
                />
              </Space>
            </Flex>
          </div>
          <Table
            dataSource={cifData?.data || []}
            loading={isPending}
            rowKey="noCIF"
            scroll={{ x: 1200 }}
            bordered
            onChange={handleTableChange}
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              current: queryParams.page,
              pageSize: queryParams.limit,
              total: cifData?.total || 0,
              locale: {
                items_per_page: "/ Halaman",
                jump_to: "Ke",
                jump_to_confirm: "konfirmasi",
                page: "Halaman",
                prev_page: "Halaman Sebelumnya",
                next_page: "Halaman Selanjutnya",
                prev_5: "5 Halaman Sebelumnya",
                next_5: "5 Halaman Selanjutnya",
                prev_3: "3 Halaman Sebelumnya",
                next_3: "3 Halaman Selanjutnya",
              },
            }}
            columns={[
              {
                title: "Kode Bank",
                dataIndex: "kdBank",
                key: "kdBank",
                ...getColumnSearchProps("kdBank"),
                // sorter: true,
              },
              {
                title: "No CIF",
                dataIndex: "noCIF",
                key: "noCIF",
                ...getColumnSearchProps("noCIF"),
                sorter: true,
                render: (text) => <span className="font-medium">{text}</span>,
              },
              {
                title: "Nama",
                dataIndex: "nama",
                key: "nama",
                ...getColumnSearchProps("nama"),
                sorter: true,
              },
              {
                title: "Jenis Kelamin",
                dataIndex: "jenisKelamin",
                key: "jenisKelamin",
                filters: [
                  {
                    text: "Pria",
                    value: "P",
                  },
                  {
                    text: "Wanita",
                    value: "W",
                  },
                ],
                sorter: true,
                filterMultiple: true,
                filterIcon: (filtered) => (
                  <FilterFilled
                    style={{ color: filtered ? "#34A853" : "#A9A9A9" }}
                  />
                ),
                render: (text) => (
                  <Tag color={text === "P" ? "blue" : "pink"}>
                    {text === "P" ? "Pria" : "Wanita"}
                  </Tag>
                ),
              },
              {
                title: "Tanggal Lahir",
                dataIndex: "tglLahir",
                key: "tglLahir",
                render: (text) => formatDate(text) || "-",
              },
              {
                title: "Tanggal Registrasi",
                dataIndex: "tglReg",
                key: "tglReg",
                filterDropdown: ({
                  setSelectedKeys,
                  selectedKeys,
                  confirm,
                  clearFilters,
                  close,
                }) => (
                  <div
                    style={{
                      padding: 8,
                      width: 260,
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <DatePicker.RangePicker
                      style={{
                        marginBottom: 8,
                        display: "block",
                        width: "100%",
                      }}
                      value={[
                        queryParams.search.start_date
                          ? dayjs(queryParams.search.start_date)
                          : null,
                        queryParams.search.end_date
                          ? dayjs(queryParams.search.end_date)
                          : null,
                      ]}
                      onChange={(dates) => {
                        // Only update our own state, not Ant Design's selectedKeys
                        setQueryParams((prev) => ({
                          ...prev,
                          search: {
                            ...prev.search,
                            start_date:
                              dates && dates[0]
                                ? dates[0].format("YYYY-MM-DD")
                                : null,
                            end_date:
                              dates && dates[1]
                                ? dates[1].format("YYYY-MM-DD")
                                : null,
                          },
                        }));
                      }}
                    />
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => {
                          confirm();
                        }}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                          width: 90,
                        }}
                      >
                        Cari
                      </Button>
                      <Button
                        onClick={() => {
                          clearFilters && clearFilters();
                          setQueryParams((prev) => ({
                            ...prev,
                            search: {
                              ...prev.search,
                              start_date: null,
                              end_date: null,
                            },
                          }));
                          close();
                        }}
                        size="small"
                        style={{
                          width: 90,
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          close();
                        }}
                      >
                        Tutup
                      </Button>
                    </Space>
                  </div>
                ),
                filterIcon: () => (
                  <SearchOutlined
                    style={{
                      color:
                        queryParams.search.start_date ||
                        queryParams.search.end_date
                          ? "#34A853"
                          : undefined,
                    }}
                  />
                ),
                sorter: true,
                onFilter: (value, record) => {
                  // The date filtering is handled by our API, so we return true here
                  // This is necessary because Ant Design expects this function
                  return true;
                },
                render: (text) => formatDate(text) || "-",
              },
              {
                title: "Alamat",
                key: "alamat",
                ...getColumnSearchProps("alamat"),
                ellipsis: true,
                render: (_, record) => {
                  const alamat =
                    [
                      record.alamatRumah1,
                      record.alamatRumah2,
                      record.alamatRumah3,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-";
                  return (
                    <span className="max-w-48 truncate block">{alamat}</span>
                  );
                },
              },
              {
                title: "Jenis ID",
                dataIndex: "jenisKartuID",
                key: "jenisKartuID",
              },
              {
                title: "No KTP",
                dataIndex: "noKartuID",
                key: "noKartuID",
                ...getColumnSearchProps("noKartuID"),
              },
              {
                title: "Nama Ibu",
                dataIndex: "namaIbuKandung",
                key: "namaIbuKandung",
                ...getColumnSearchProps("namaIbuKandung"),
                sorter: true,
              },
              {
                title: "Karyawan",
                dataIndex: "karyawan",
                key: "karyawan",
                filters: [
                  {
                    text: "Ya",
                    value: "Y",
                  },
                  {
                    text: "Tidak",
                    value: "T",
                  },
                ],
                sorter: true,
                filterMultiple: true,
                filterIcon: (filtered) => (
                  <FilterFilled
                    style={{ color: filtered ? "#34A853" : "#A9A9A9" }}
                  />
                ),
                render: (text) => (
                  <Tag color={text === "Y" ? "green" : "default"}>
                    {text === "Y" ? "Ya" : "Tidak"}
                  </Tag>
                ),
              },
              {
                title: "Aksi",
                key: "action",
                fixed: "right",
                width: 150,
                render: (_, record) => (
                  <Space size="small">
                    <Button
                      size="small"
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleDetail(record)}
                    />
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(record.noCIF)}
                    />
                  </Space>
                ),
              },
            ]}
          />
        </>
      )}

      {/* Create Modal */}
      <Drawer
        title="Tambah CIF Baru"
        open={isModalOpen.IsCreate}
        onClose={() => setIsModalOpen((prev) => ({ ...prev, IsCreate: false }))}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        <CIFForm
          form={formData}
          onFinish={() => handleSubmit(false)}
          isLoading={createCIFMutation.isPending}
        />
      </Drawer>

      {/* Edit Modal */}
      <Drawer
        title={`Edit CIF - ${selectedCIF?.noCIF}`}
        open={isModalOpen.IsEdit}
        onClose={() => setIsModalOpen((prev) => ({ ...prev, IsEdit: false }))}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        <CIFForm
          form={formData}
          onFinish={() => handleSubmit(true)}
          isLoading={updateCIFMutation.isPending}
          initialValues={selectedCIF}
          isEdit
        />
      </Drawer>
      {isDetailOpen && (
        <CIFDetail data={selectedCIF} onBack={() => setIsDetailOpen(false)} />
      )}
    </Card>
  );
};

// Form Component
const CIFForm = ({ form, onFinish, loading, isEdit, initialValues }) => {
  const [datadarurat, setDataDarurat] = useState([]);
  const [dataPenjamin, setDataPenjamin] = useState([]);
  const [editingDaruratIndex, setEditingDaruratIndex] = useState(null);
  const [editingPenjaminIndex, setEditingPenjaminIndex] = useState(null);
  const [daruratForm] = Form.useForm();
  const [penjaminForm] = Form.useForm();

  const { data: selectData } = useGetAllSelectCIF();
  const createCIFDaruratMutation = useCreateCIFDarurat();
  const updateCIFDaruratMutation = useUpdateCIFDarurat();
  const deleteCIFDaruratMutation = useDeleteCIFDarurat();
  const createCIFPenjaminMutation = useCreateCIFPenjamin();
  const updateCIFPenjaminMutation = useUpdateCIFPenjamin();
  const deleteCIFPenjaminMutation = useDeleteCIFPenjamin();

  const ktpSeumurHidup = Form.useWatch("kTPseumurHidup", form);
  const ktpSeumurHidupPasangan = Form.useWatch("kTPseumurHidupPasangan", form);
  const ktpSeumurHidupIbu = Form.useWatch("kTPseumurHidupIbu", form);
  const statusKawin = Form.useWatch("statusKawin", form);

  useEffect(() => {
    if (initialValues?.cifDarurat) {
      setDataDarurat(initialValues?.cifDarurat);
    }
    if (initialValues?.cifPenjamin) {
      setDataPenjamin(initialValues?.cifPenjamin);
    }
  }, [initialValues]);

  // Helper function to get options by group
  const getOptionsByGroup = (groupName) => {
    if (!selectData?.data || !selectData.data[groupName]) return [];
    return selectData.data[groupName];
  };

  // Helper function to render select options
  const renderSelectOptions = (groupName) => {
    const options = getOptionsByGroup(groupName);
    return options.map((option) => (
      <Option key={option.id} value={option.id}>
        {option.keterangan}
      </Option>
    ));
  };

  const columnsDarurat = [
    {
      title: "Nama Darurat",
      dataIndex: "namaDarurat",
      key: "namaDarurat",
    },
    {
      title: "Hubungan",
      dataIndex: "hubungan",
      key: "hubungan",
    },
    {
      title: "No HP",
      dataIndex: "noHp",
      key: "noHp",
    },
    {
      title: "No Telp",
      dataIndex: "noTelp",
      key: "noTelp",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Alamat KTP",
      dataIndex: "alamatKTP",
      key: "alamatKTP",
    },
    {
      title: "Alamat Domisili",
      dataIndex: "alamatDomisili",
      key: "alamatDomisili",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record, index) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditDarurat(record, index)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDarurat(index)}
          />
        </Space>
      ),
    },
  ];

  // 5. Columns untuk Table Data Penjamin
  const columnsPenjamin = [
    {
      title: "Nama Penjamin",
      dataIndex: "namaPenjamin",
      key: "namaPenjamin",
    },
    {
      title: "Hubungan",
      dataIndex: "hubungan",
      key: "hubungan",
    },
    {
      title: "No HP",
      dataIndex: "noHp",
      key: "noHp",
    },
    {
      title: "No Telp",
      dataIndex: "noTelp",
      key: "noTelp",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Alamat KTP",
      dataIndex: "alamatKTP",
      key: "alamatKTP",
    },
    {
      title: "Alamat Domisili",
      dataIndex: "alamatDomisili",
      key: "alamat",
    },
    {
      title: "Pekerjaan",
      dataIndex: "pekerjaan",
      key: "pekerjaan",
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan",
      key: "jabatan",
    },
    {
      title: "Alamat Pekerjaan",
      dataIndex: "alamatPekerjaan",
      key: "alamatPekerjaan",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
    },
    {
      title: "Aksi",
      key: "aksi",
      fixed: "right",
      render: (_, record, index) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPenjamin(record, index)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePenjamin(index)}
          />
        </Space>
      ),
    },
  ];

  // Update handleAddDarurat - reset form untuk mode create
  const handleAddDarurat = () => {
    setEditingDaruratIndex(null);
    daruratForm.resetFields();
  };

  // Update handleEditDarurat - populate form dengan data yang akan diedit
  const handleEditDarurat = (record, index) => {
    setEditingDaruratIndex(index);
    daruratForm.setFieldsValue(record);
  };

  const handleDeleteDarurat = async (index) => {
    const record = datadarurat[index];

    Modal.confirm({
      title: "Hapus Data Darurat",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      onOk: async () => {
        try {
          if (record.idCIFDarurat) {
            await deleteCIFDaruratMutation.mutateAsync(record.idCIFDarurat);
          }

          const newData = [...datadarurat];
          newData.splice(index, 1);
          setDataDarurat(newData);
          form.setFieldsValue({ cifDarurat: newData });

          // Reset form jika sedang edit data yang dihapus
          if (editingDaruratIndex === index) {
            handleAddDarurat();
          }

          if (!record.idCIFDarurat) {
            message.success("Data darurat berhasil dihapus");
          }
        } catch (error) {
          console.error("Error deleting darurat:", error);
        }
      },
    });
  };

  // Update handleAddPenjamin
  const handleAddPenjamin = () => {
    setEditingPenjaminIndex(null);
    penjaminForm.resetFields();
  };

  // Update handleEditPenjamin
  const handleEditPenjamin = (record, index) => {
    setEditingPenjaminIndex(index);
    penjaminForm.setFieldsValue(record);
  };

  // Update handleDeletePenjamin
  const handleDeletePenjamin = async (index) => {
    const record = dataPenjamin[index];

    Modal.confirm({
      title: "Hapus Data Penjamin",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      onOk: async () => {
        try {
          if (record.idCIFPenjamin) {
            await deleteCIFPenjaminMutation.mutateAsync(record.idCIFPenjamin);
          }

          const newData = [...dataPenjamin];
          newData.splice(index, 1);
          setDataPenjamin(newData);
          form.setFieldsValue({ cifPenjamin: newData });

          // Reset form jika sedang edit data yang dihapus
          if (editingPenjaminIndex === index) {
            handleAddPenjamin();
          }

          if (!record.idCIFPenjamin) {
            message.success("Data penjamin berhasil dihapus");
          }
        } catch (error) {
          console.error("Error deleting penjamin:", error);
        }
      },
    });
  };

  // Fungsi untuk handle submit form darurat
  const handleDaruratSubmit = async (values) => {
    try {
      const dataToSubmit = {
        NoCIF: initialValues?.noCIF,
        NamaDarurat: values.namaDarurat,
        Hubungan: values.hubungan,
        NoHp: values.noHp,
        NoTelp: values.noTelp,
        Email: values.email,
        AlamatKTP: values.alamatKTP,
        AlamatDomisili: values.alamatDomisili,
        Keterangan: values.keterangan,
      };

      if (editingDaruratIndex !== null) {
        // Update existing record
        const existingRecord = datadarurat[editingDaruratIndex];

        if (existingRecord.idCIFDarurat) {
          await updateCIFDaruratMutation.mutateAsync({
            id: existingRecord.idCIFDarurat,
            data: dataToSubmit,
          });
        }

        // Update local state
        const newData = [...datadarurat];
        newData[editingDaruratIndex] = { ...existingRecord, ...values };
        setDataDarurat(newData);
        form.setFieldsValue({ cifDarurat: newData });

        if (!existingRecord.idCIFDarurat) {
          message.success("Data darurat berhasil diupdate");
        }
      } else {
        // Create new record
        if (initialValues?.noCIF) {
          const response = await createCIFDaruratMutation.mutateAsync(
            dataToSubmit
          );
          const newRecord = { ...values, idCIFDarurat: response.data?.id };
          const newData = [...datadarurat, newRecord];
          setDataDarurat(newData);
          form.setFieldsValue({ cifDarurat: newData });
        } else {
          const newData = [...datadarurat, values];
          setDataDarurat(newData);
          form.setFieldsValue({ cifDarurat: newData });
          message.success("Data darurat berhasil ditambahkan");
        }
      }

      // Reset form setelah berhasil
      handleAddDarurat();
    } catch (error) {
      console.error("Error saving darurat:", error);
    }
  };

  // Fungsi untuk handle submit form penjamin
  const handlePenjaminSubmit = async (values) => {
    try {
      const dataToSubmit = {
        NoCIF: initialValues?.noCIF,
        NamaPenjamin: values.namaPenjamin,
        Hubungan: values.hubungan,
        NoHp: values.noHp,
        NoTelp: values.noTelp,
        Email: values.email,
        AlamatKTP: values.alamatKTP,
        AlamatDomisili: values.alamatDomisili,
        AlamatPekerjaan: values.alamatPekerjaan,
        Pekerjaan: values.pekerjaan,
        Jabatan: values.jabatan,
        Keterangan: values.keterangan,
      };

      if (editingPenjaminIndex !== null) {
        // Update existing record
        const existingRecord = dataPenjamin[editingPenjaminIndex];

        if (existingRecord.idCIFPenjamin) {
          await updateCIFPenjaminMutation.mutateAsync({
            id: existingRecord.idCIFPenjamin,
            data: dataToSubmit,
          });
        }
        console.log("Editing Penjamin Index:", editingPenjaminIndex);
        console.log("Updating existing record:", existingRecord);

        // Update local state
        const newData = [...dataPenjamin];
        newData[editingPenjaminIndex] = { ...existingRecord, ...values };
        setDataPenjamin(newData);
        form.setFieldsValue({ cifPenjamin: newData });

        if (!existingRecord.idCIFPenjamin) {
          message.success("Data penjamin berhasil diupdate");
        }
      } else {
        // Create new record
        if (initialValues?.noCIF) {
          const response = await createCIFPenjaminMutation.mutateAsync(
            dataToSubmit
          );
          console.log(response.data);

          const newRecord = {
            ...values,
            idCIFPenjamin: response.data?.data?.idCIFPenjamin,
          };
          const newData = [...dataPenjamin, newRecord];
          setDataPenjamin(newData);
          form.setFieldsValue({ cifPenjamin: newData });
        } else {
          const newData = [...dataPenjamin, values];
          setDataPenjamin(newData);
          form.setFieldsValue({ cifPenjamin: newData });
          message.success("Data penjamin berhasil ditambahkan");
        }
      }

      // Reset form setelah berhasil
      handleAddPenjamin();
    } catch (error) {
      console.error("Error saving penjamin:", error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-4"
    >
      <Tabs defaultActiveKey="umum" className="w-full">
        <TabPane tab="Data Umum" key="umum">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nama CIF"
                name="nama"
                rules={[{ required: true, message: "Nama harus diisi" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nama Lengkap" name="namaLengkap">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tempat Lahir" name="tempatLahir">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tanggal Lahir" name="tglLahir">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tanggal Registrasi" name="tglReg">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat Rumah 1" name="alamatRumah1">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat Rumah 2" name="alamatRumah2">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat Rumah 3" name="alamatRumah3">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Negara" name="kdNegara">
                <Select
                  placeholder="Pilih Kode Negara"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("KodeNegara")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Alamat Sesuai Identitas"
                name="alamatSesuaiIdentitas"
              >
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Pengiriman Surat" name="pengirimanSurat">
                <Select placeholder="Pilih">
                  <Option value="1">Ya</Option>
                  <Option value="2">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Sandi Dati 2" name="kdDati2">
                <Select
                  placeholder="Pilih Kode Dati 2"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Dati2")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Pos" name="kdPosRumah">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kota" name="kotaRumah">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Telp Rumah" name="telpRumah">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No. Fax" name="noFaxR">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Data Perorangan" key="perorangan">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Jenis Kelamin" name="jenisKelamin">
                <Select placeholder="Pilih Jenis Kelamin">
                  {renderSelectOptions("JenKel")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status Kawin" name="statusKawin">
                <Select placeholder="Pilih Status Kawin">
                  {renderSelectOptions("MStatus")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Gelar Akademik" name="gelarAkademik">
                <Select
                  placeholder="Pilih Gelar Akademik"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Gelar")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Penghasilan" name="kdPenghasilan">
                <Select placeholder="Pilih Kode Penghasilan">
                  {renderSelectOptions("Penghasilan")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Penghasilan Per Tahun"
                name="penghasilanPerTahun"
              >
                <InputNumber
                  className="!w-full"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Lama Bekerja" name="lamaBekerja">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Agama" name="agama">
                <Select placeholder="Pilih Agama">
                  {renderSelectOptions("Agama")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Agama Lain" name="agamaLain">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kewarganegaraan" name="kewargaNegaraan">
                <Select placeholder="Pilih Kewarganegaraan">
                  {renderSelectOptions("WargaNegara")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Negara Kewarganegaraan"
                name="negaraKewargaNegaraan"
              >
                <Select
                  placeholder="Pilih Negara Kewarganegaraan"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("KodeNegara")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Jenis Kartu ID" name="jenisKartuID">
                <Select placeholder="Pilih Jenis Kartu ID">
                  {renderSelectOptions("JenisID")}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="No Kartu ID" name="noKartuID">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Berlaku Sampai" name="berlakuSampai">
                <DatePicker
                  className="w-full"
                  disabled={ktpSeumurHidup === "Y"}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="KTP Seumur Hidup" name="kTPseumurHidup">
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kartu ID Lain" name="kartuIDLain">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="NPWP Perorangan" name="npwPperorangan">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Jumlah Tanggungan" name="jumTanggungan">
                <InputNumber className="w-full" min={0} max={99} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Jarak Lokasi Usaha" name="jrkLokUsaha">
                <Select placeholder="Pilih Jarak Lokasi Usaha">
                  {renderSelectOptions("KodeJrkLokUsaha")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Jenis CIF" name="jenisCIF">
                <Select placeholder="Pilih Jenis CIF">
                  {renderSelectOptions("KodeJenisCIF")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Info Negatif" name="infoNegatif">
                <Select placeholder="Pilih Info Negatif">
                  {renderSelectOptions("KodeInfoNegatif")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Struktur Pemilik" name="strukturPemilik">
                <Select placeholder="Pilih Struktur Pemilik">
                  {renderSelectOptions("KodeStrukturPemilik")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ada SP Pisah Harta" name="adaSPisahHarta">
                <Select placeholder="Pilih" disabled={statusKawin !== "01"}>
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Rek Koran By Email" name="rekKoranByEmail">
                <Select placeholder="Pilih">
                  <Option value={true}>Ya</Option>
                  <Option value={false}>Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="CIF Perbankan" name="isPerbankan">
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Foto" name="foto">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Data Usaha" key="usaha">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kode Jabatan" name="kdJabatan">
                <Select
                  placeholder="Pilih Kode Jabatan"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Jabatan")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Jabatan" name="jabatan">
                <Select
                  placeholder="Pilih Jabatan"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Jabatan")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Jabatan Perorangan" name="jabatanPerorangan">
                <Select
                  placeholder="Pilih Jabatan Perorangan"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Jabatan")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Pangkat" name="pangkat">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat Kantor 1" name="alamatKantor1">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat Kantor 2" name="alamatKantor2">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat Kantor 3" name="alamatKantor3">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kota Kantor" name="kotaKantor">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Pos Kantor" name="kdPosKantor">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Telp Kantor" name="telpKantor">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No Akte Pendirian BH" name="noAktePendirianBH">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tanggal Akte Pendirian BH"
                name="tglAktePendirianBH"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="No Akte Ubah Terakhir"
                name="noAkteUbahTerakhir"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tanggal Akte Ubah Terakhir"
                name="tglAkteUbahTerakhir"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kota Pendirian BH" name="kotaPendirianBH">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No Fax Kantor" name="noFaxK">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Rating" name="rating">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Lembaga Rating" name="lembagaRating">
                <Select placeholder="Pilih Lembaga Rating">
                  {renderSelectOptions("LembagaRating")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tanggal Rating" name="tglRating">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="NPWP Usaha" name="npwp">
                <Input />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item label="Sandi PEP" name="sandiPEP">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Karyawan" name="karyawan">
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sandi Usaha Risiko Tinggi"
                name="sandiUsahaRisikoTinggi"
              >
                <Input />
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item label="Go Public" name="goPublic">
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="T">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Sandi Dati 1" name="kdDati1">
                <Select placeholder="Pilih Kode Dati 1">
                  {renderSelectOptions("Dati1")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Group" name="kdGrp">
                <Select placeholder="Pilih Kode Group">
                  {renderSelectOptions("Group")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode BH" name="kdBH">
                <Select placeholder="Pilih Kode Badan Hukum">
                  {renderSelectOptions("BadanHukum")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Group 2" name="kdGrp2">
                <Select placeholder="Pilih Kode Group 2">
                  {renderSelectOptions("Group")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Gol Nasabah" name="kdGOL_Nasabah">
                <Select
                  placeholder="Pilih Kode Golongan Nasabah"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("SGOLDEB")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kode Group 3" name="kdGrp3">
                <Select placeholder="Pilih Kode Group 3">
                  {renderSelectOptions("Group")}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Data Keluarga" key="keluarga">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nama Pasangan" name="nmPasangan">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nama Ibu Kandung" name="namaIbuKandung">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Jenis Kartu ID Pasangan"
                name="jnsKartuIDPasangan"
              >
                <Select placeholder="Pilih Jenis Kartu ID">
                  {renderSelectOptions("JenisID")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Jenis Kartu ID Ibu" name="jnsKartuIDIbu">
                <Select placeholder="Pilih Jenis Kartu ID">
                  {renderSelectOptions("JenisID")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No Kartu ID Pasangan" name="noKartuIDPasangan">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No Kartu ID Ibu" name="noKartuIDIbu">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tempat Lahir Pasangan" name="tmptLahirPasangan">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tanggal Lahir Pasangan" name="tglLahirPasangan">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tempat Lahir Ibu" name="tmptLahirIbu">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tanggal Lahir Ibu" name="tglLahirIbu">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Berlaku ID Pasangan" name="berlakuIDPasangan">
                <DatePicker
                  className="w-full"
                  disabled={ktpSeumurHidupPasangan === "Y"}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="KTP Seumur Hidup Pasangan"
                name="kTPseumurHidupPasangan"
              >
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Berlaku ID Ibu" name="berlakuIDIbu">
                <DatePicker
                  className="w-full"
                  disabled={ktpSeumurHidupIbu === "Y"}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="KTP Seumur Hidup Ibu" name="kTPseumurHidupIbu">
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tinggal Debitur Pasangan"
                name="tinggalDebiturPasangan"
              >
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tinggal Debitur Ibu" name="tinggalDebiturIbu">
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No HP Pasangan" name="noHpPasangan">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No HP Ibu" name="noHpIbu">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No HP Pasangan 2" name="noHpPasangan2">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No HP Ibu 2" name="noHpIbu2">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat KTP Pasangan" name="alamatKTPPasangan">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat KTP Ibu" name="alamatKTPIbu">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Alamat Domisili Pasangan"
                name="alamatDomisiliPasangan"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alamat Domisili Ibu" name="alamatDomisiliIbu">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Pekerjaan Pasangan" name="pekerjaanPasangan">
                <Select
                  placeholder="Pilih Pekerjaan"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Pekerjaan")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Pekerjaan Ibu" name="pekerjaanIbu">
                <Select
                  placeholder="Pilih Pekerjaan"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Pekerjaan")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nama PT Pasangan" name="namaPTPasangan">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nama PT Ibu" name="namaPTIbu">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Data Darurat" key="darurat">
          <div className="space-y-4">
            {/* Form untuk Create/Update Darurat */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium">
                  {editingDaruratIndex !== null
                    ? "Edit Data Darurat"
                    : "Tambah Data Darurat"}
                </h4>
                {editingDaruratIndex !== null && (
                  <Button
                    size="small"
                    onClick={handleAddDarurat}
                    icon={<PlusOutlined />}
                  >
                    Mode Tambah
                  </Button>
                )}
              </div>

              {/* UBAH: Hapus onFinish dari Form, gunakan onClick pada Button */}
              <Form form={daruratForm} layout="vertical" size="small">
                <Row gutter={[12, 0]}>
                  <Col span={8}>
                    <Form.Item
                      label="Nama Darurat"
                      name="namaDarurat"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                      className="mb-2"
                    >
                      <Input placeholder="Nama Darurat" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Hubungan"
                      name="hubungan"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                      className="mb-2"
                    >
                      <Input placeholder="Hubungan" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="No HP"
                      name="noHp"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="No HP" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="No Telp"
                      name="noTelp"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="No Telp" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Email"
                      name="email"
                      className="mb-2"
                      rules={[
                        { type: "email", message: "Format email tidak valid" },
                        { required: true, message: "Wajib diisi" },
                      ]}
                    >
                      <Input placeholder="Email" type="email" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Alamat KTP"
                      name="alamatKTP"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="Alamat KTP" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Alamat Domisili"
                      name="alamatDomisili"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="Alamat Domisili" />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      label="Keterangan"
                      name="keterangan"
                      className="mb-2"
                    >
                      <Input.TextArea rows={2} placeholder="Keterangan" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <div className="flex justify-end gap-2">
                      <Button onClick={handleAddDarurat}>Reset</Button>
                      {/* UBAH: Gunakan onClick handler dan validateFields */}
                      <Button
                        type="primary"
                        loading={
                          createCIFDaruratMutation.isPending ||
                          updateCIFDaruratMutation.isPending
                        }
                        icon={
                          editingDaruratIndex !== null ? (
                            <EditOutlined />
                          ) : (
                            <PlusOutlined />
                          )
                        }
                        onClick={async () => {
                          try {
                            const values = await daruratForm.validateFields();
                            handleDaruratSubmit(values);
                          } catch (error) {
                            console.log("Validation failed:", error);
                          }
                        }}
                      >
                        {editingDaruratIndex !== null ? "Update" : "Tambah"}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>

            {/* Table Data Darurat */}
            <div>
              <h3 className="text-lg font-medium mb-3">Daftar Data Darurat</h3>
              <Table
                columns={columnsDarurat}
                dataSource={datadarurat}
                rowKey={(record, index) => record.idCIFDarurat || index}
                pagination={false}
                size="small"
                locale={{
                  emptyText: "Tidak ada data darurat",
                }}
                rowClassName={(record, index) =>
                  editingDaruratIndex === index ? "bg-blue-50" : ""
                }
              />
            </div>
          </div>
        </TabPane>
        <TabPane tab="Data Penjamin" key="penjamin">
          <div className="space-y-4">
            {/* Form untuk Create/Update Penjamin */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium">
                  {editingPenjaminIndex !== null
                    ? "Edit Data Penjamin"
                    : "Tambah Data Penjamin"}
                </h4>
                {editingPenjaminIndex !== null && (
                  <Button
                    size="small"
                    onClick={handleAddPenjamin}
                    icon={<PlusOutlined />}
                  >
                    Mode Tambah
                  </Button>
                )}
              </div>

              {/* UBAH: Hapus onFinish dari Form, gunakan onClick pada Button */}
              <Form form={penjaminForm} layout="vertical" size="small">
                <Row gutter={[12, 0]}>
                  <Col span={8}>
                    <Form.Item
                      label="Nama Penjamin"
                      name="namaPenjamin"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                      className="mb-2"
                    >
                      <Input placeholder="Nama Penjamin" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Hubungan"
                      name="hubungan"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                      className="mb-2"
                    >
                      <Input placeholder="Hubungan" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="No HP"
                      name="noHp"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="No HP" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="No Telp"
                      name="noTelp"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="No Telp" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Email"
                      name="email"
                      className="mb-2"
                      rules={[
                        { type: "email", message: "Format email tidak valid" },
                        { required: true, message: "Wajib diisi" },
                      ]}
                    >
                      <Input placeholder="Email" type="email" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Pekerjaan"
                      name="pekerjaan"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="Pekerjaan" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Jabatan"
                      name="jabatan"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="Jabatan" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Alamat KTP"
                      name="alamatKTP"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="Alamat KTP" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Alamat Domisili"
                      name="alamatDomisili"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="Alamat Domisili" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Alamat Pekerjaan"
                      name="alamatPekerjaan"
                      className="mb-2"
                      rules={[{ required: true, message: "Wajib diisi" }]}
                    >
                      <Input placeholder="Alamat Pekerjaan" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Keterangan"
                      name="keterangan"
                      className="mb-2"
                    >
                      <Input.TextArea rows={2} placeholder="Keterangan" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <div className="flex justify-end gap-2">
                      <Button onClick={handleAddPenjamin}>Reset</Button>
                      {/* UBAH: Gunakan onClick handler dan validateFields */}
                      <Button
                        type="primary"
                        loading={
                          createCIFPenjaminMutation.isPending ||
                          updateCIFPenjaminMutation.isPending
                        }
                        icon={
                          editingPenjaminIndex !== null ? (
                            <EditOutlined />
                          ) : (
                            <PlusOutlined />
                          )
                        }
                        onClick={async () => {
                          try {
                            const values = await penjaminForm.validateFields();
                            handlePenjaminSubmit(values);
                          } catch (error) {
                            console.log("Validation failed:", error);
                          }
                        }}
                      >
                        {editingPenjaminIndex !== null ? "Update" : "Tambah"}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>

            {/* Table Data Penjamin */}
            <div>
              <h3 className="text-lg font-medium mb-3">Daftar Data Penjamin</h3>
              <Table
                columns={columnsPenjamin}
                dataSource={dataPenjamin}
                rowKey={(record, index) => record.idCIFPenjamin || index}
                pagination={false}
                scroll={{ x: 1500 }}
                size="small"
                locale={{
                  emptyText: "Tidak ada data penjamin",
                }}
                rowClassName={(record, index) =>
                  editingPenjaminIndex === index ? "bg-blue-50" : ""
                }
              />
            </div>
          </div>
        </TabPane>
        <TabPane tab="Data Lainnya" key="lainnya">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kode Gol" name="kdGol">
                <Select
                  placeholder="Pilih Kode Golongan"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("Golongan")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Kode Gol SLIK"
                name="kdGol_SLIK"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                <Select
                  placeholder="Pilih Kode Golongan SLIK"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderSelectOptions("GolSLIK")}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mutlak Kena Pajak" name="mutlakKenaPajak">
                <Select placeholder="Pilih">
                  <Option value="Y">Ya</Option>
                  <Option value="N">Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No Urut Fasilitas" name="noUrutFasilitas">
                <InputNumber className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Upload 2 Konsol" name="upload2Konsol">
                <Select placeholder="Pilih">
                  <Option value={true}>Ya</Option>
                  <Option value={false}>Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Is Blokir Tab" name="isBlokirTab">
                <Select placeholder="Pilih">
                  <Option value={true}>Ya</Option>
                  <Option value={false}>Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="CIF Warning" name="cIFwarning">
                <Select placeholder="Pilih">
                  <Option value={true}>Ya</Option>
                  <Option value={false}>Tidak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="No CIF Lama" name="noCIFlama">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Button htmlType="button" onClick={() => form.resetFields()}>
          Reset
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {isEdit ? "Update" : "Simpan"}
        </Button>
      </div>
    </Form>
  );
};

const CIFDetail = ({ data, onBack }) => {
  const { data: selectData } = useGetAllSelectCIF();

  const getOptionsByGroup = (groupName) => {
    if (!selectData?.data || !selectData.data[groupName]) return [];
    return selectData.data[groupName];
  };

  const getKeteranganByGroupAndId = (groupName, id) =>
    getOptionsByGroup(groupName).find((opt) => opt.id === id)?.keterangan ||
    "-";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  // Component untuk field item individual
  const FieldItem = ({ label, value, type = "text", className = "" }) => (
    <div className={`mb-4 ${className}`}>
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className="flex items-center gap-2">
        {type === "badge" ? (
          <Badge
            status={value === "Ya" ? "success" : "default"}
            text={value}
            className="text-sm"
          />
        ) : type === "currency" ? (
          <span className="text-base font-semibold text-blue-600">{value}</span>
        ) : (
          <span className="text-base text-gray-800">{value}</span>
        )}
      </div>
    </div>
  );

  // Component untuk section dengan grid
  const FieldSection = ({ title, fields, columns = 2 }) => (
    <Card
      title={title}
      className="w-full !mb-6"
      headStyle={{ fontSize: "16px", fontWeight: "600" }}
    >
      <div
        className={`grid gap-6 ${
          columns === 3
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {fields.map((field, index) => (
          <FieldItem
            key={index}
            label={field.label}
            value={field.value}
            type={field.type}
          />
        ))}
      </div>
    </Card>
  );

  // Data untuk setiap tab
  const tabData = {
    umum: {
      title: "Informasi Umum",
      icon: <UserOutlined />,
      sections: [
        {
          title: "Identitas Dasar",
          fields: [
            { label: "Kode Bank", value: data.kdBank || "-" },
            { label: "No CIF", value: data.noCIF || "-" },
            { label: "Kode Cabang", value: data.kdCabang || "-" },
            { label: "No Urut", value: data.noUrut || "-" },
            { label: "Nama", value: data.nama || "-" },
            { label: "Nama Lengkap", value: data.namaLengkap || "-" },
            { label: "Tempat Lahir", value: data.tempatLahir || "-" },
            { label: "Tanggal Lahir", value: formatDate(data.tglLahir) },
          ],
        },
        {
          title: "Alamat Tempat Tinggal",
          fields: [
            { label: "Alamat Rumah 1", value: data.alamatRumah1 || "-" },
            { label: "Alamat Rumah 2", value: data.alamatRumah2 || "-" },
            { label: "Alamat Rumah 3", value: data.alamatRumah3 || "-" },
            { label: "Kota", value: data.kotaRumah || "-" },
            { label: "Kode Pos", value: data.kdPosRumah || "-" },
            {
              label: "Kode Dati 2",
              value: getKeteranganByGroupAndId("Dati2", data.kdDati2),
            },
          ],
        },
        {
          title: "Informasi Registrasi",
          fields: [
            {
              label: "Gelar Akademik",
              value: getKeteranganByGroupAndId("Gelar", data.gelarAkademik),
            },
            { label: "Tanggal Registrasi", value: formatDate(data.tglReg) },
            {
              label: "Jenis CIF",
              value: getKeteranganByGroupAndId("KodeJenisCIF", data.jenisCIF),
            },
            {
              label: "Kode Negara",
              value: getKeteranganByGroupAndId("KodeNegara", data.kdNegara),
            },
            {
              label: "Alamat Sesuai Identitas",
              value: data.alamatSesuaiIdentitas === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
            {
              label: "Pengiriman Surat",
              value: data.pengirimanSurat === "1" ? "Ya" : "Tidak",
              type: "badge",
            },
            { label: "Telp Rumah", value: data.telpRumah || "-" },
            { label: "No. Fax", value: data.noFaxR || "-" },
          ],
        },
      ],
    },

    perorangan: {
      title: "Data Perorangan",
      icon: <UserOutlined />,
      sections: [
        {
          title: "Informasi Personal",
          fields: [
            {
              label: "Jenis Kelamin",
              value: getKeteranganByGroupAndId("JenKel", data.jenisKelamin),
            },
            {
              label: "Status Kawin",
              value: getKeteranganByGroupAndId("MStatus", data.statusKawin),
            },
            {
              label: "Agama",
              value: getKeteranganByGroupAndId("Agama", data.agama),
            },
            { label: "Agama Lain", value: data.agamaLain || "-" },
            {
              label: "Kewarganegaraan",
              value: getKeteranganByGroupAndId(
                "WargaNegara",
                data.kewargaNegaraan
              ),
            },
            {
              label: "Negara Kewarganegaraan",
              value: getKeteranganByGroupAndId(
                "KodeNegara",
                data.negaraKewargaNegaraan
              ),
            },
          ],
        },
        {
          title: "Identitas & Dokumen",
          fields: [
            {
              label: "Jenis Kartu ID",
              value: getKeteranganByGroupAndId("JenisID", data.jenisKartuID),
            },
            { label: "No Kartu ID", value: data.noKartuID || "-" },
            { label: "Berlaku Sampai", value: formatDate(data.berlakuSampai) },
            {
              label: "KTP Seumur Hidup",
              value: data.ktPseumurHidup === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
            { label: "Kartu ID Lain", value: data.kartuIDLain || "-" },
            { label: "NPWP", value: data.npwp || "-" },
            { label: "NPWP Perorangan", value: data.npwPperorangan || "-" },
          ],
        },
        {
          title: "Penghasilan & Pekerjaan",
          fields: [
            {
              label: "Kode Penghasilan",
              value: getKeteranganByGroupAndId(
                "Penghasilan",
                data.kdPenghasilan
              ),
            },
            {
              label: "Penghasilan Per Tahun",
              value: formatCurrency(data.penghasilanPerTahun),
              type: "currency",
            },
            { label: "Lama Bekerja", value: data.lamaBekerja || "-" },
            {
              label: "Jarak Lokasi Usaha",
              value: getKeteranganByGroupAndId(
                "KodeJrkLokUsaha",
                data.jrkLokUsaha
              ),
            },
          ],
        },
      ],
    },

    usaha: {
      title: "Data Usaha",
      icon: <BankOutlined />,
      sections: [
        {
          title: "Informasi Pekerjaan",
          fields: [
            {
              label: "Kode Jabatan",
              value: getKeteranganByGroupAndId("Jabatan", data.kdJabatan),
            },
            {
              label: "Jabatan",
              value: getKeteranganByGroupAndId("Jabatan", data.jabatan),
            },
            {
              label: "Jabatan Perorangan",
              value: getKeteranganByGroupAndId(
                "Jabatan",
                data.jabatanPerorangan
              ),
            },
            { label: "Pangkat", value: data.pangkat || "-" },
          ],
        },
        {
          title: "Alamat Kantor",
          fields: [
            { label: "Alamat Kantor 1", value: data.alamatKantor1 || "-" },
            { label: "Alamat Kantor 2", value: data.alamatKantor2 || "-" },
            { label: "Alamat Kantor 3", value: data.alamatKantor3 || "-" },
            { label: "Kota Kantor", value: data.kotaKantor || "-" },
            { label: "Kode Pos Kantor", value: data.kdPosKantor || "-" },
            { label: "Telp Kantor", value: data.telpKantor || "-" },
            { label: "No Fax Kantor", value: data.noFaxK || "-" },
          ],
        },
        {
          title: "Legalitas Usaha",
          fields: [
            {
              label: "No Akte Pendirian BH",
              value: data.noAktePendirianBH || "-",
            },
            {
              label: "Tanggal Akte Pendirian",
              value: formatDate(data.tglAktePendirianBH),
            },
            {
              label: "No Akte Ubah Terakhir",
              value: data.noAkteUbahTerakhir || "-",
            },
            {
              label: "Tanggal Akte Ubah Terakhir",
              value: formatDate(data.tglAkteUbahTerakhir),
            },
            { label: "Kota Pendirian BH", value: data.kotaPendirianBH || "-" },
            {
              label: "Kode BH",
              value: getKeteranganByGroupAndId("BadanHukum", data.kdBH),
            },
          ],
        },
        {
          title: "Informasi Tambahan",
          fields: [
            {
              label: "Rating",
              value: data.rating || "-",
            },
            {
              label: "Lembaga Rating",
              value: getKeteranganByGroupAndId(
                "LembagaRating",
                data.lembagaRating
              ),
            },
            {
              label: "Tanggal Rating",
              value: formatDate(data.tglRating),
            },
            {
              label: "Go Public",
              value: data.goPublic === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
          ],
        },
      ],
    },

    keluarga: {
      title: "Data Keluarga",
      icon: <TeamOutlined />,
      sections: [
        {
          title: "Informasi Pasangan",
          fields: [
            { label: "Nama Pasangan", value: data.nmPasangan || "-" },
            {
              label: "Jenis Kartu ID Pasangan",
              value: getKeteranganByGroupAndId(
                "JenisID",
                data.jnsKartuIDPasangan
              ),
            },
            {
              label: "No Kartu ID Pasangan",
              value: data.noKartuIDPasangan || "-",
            },
            {
              label: "Berlaku ID Pasangan",
              value: formatDate(data.berlakuIDPasangan),
            },
            {
              label: "KTP Seumur Hidup Pasangan",
              value: data.ktPseumurHidupPasangan === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
            {
              label: "Tempat Lahir Pasangan",
              value: data.tmptLahirPasangan || "-",
            },
            {
              label: "Tanggal Lahir Pasangan",
              value: formatDate(data.tglLahirPasangan),
            },
            { label: "No HP Pasangan", value: data.noHpPasangan || "-" },
            { label: "No HP Pasangan 2", value: data.noHpPasangan2 || "-" },
            {
              label: "Alamat KTP Pasangan",
              value: data.alamatKTPPasangan || "-",
            },
            {
              label: "Alamat Domisili Pasangan",
              value: data.alamatDomisiliPasangan || "-",
            },
            {
              label: "Tinggal Debitur Pasangan",
              value: data.tinggalDebiturPasangan === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
            {
              label: "Pekerjaan Pasangan",
              value: getKeteranganByGroupAndId(
                "Pekerjaan",
                data.pekerjaanPasangan
              ),
            },
            { label: "Nama PT Pasangan", value: data.namaPTPasangan || "-" },
          ],
        },
        {
          title: "Informasi Ibu Kandung",
          fields: [
            { label: "Nama Ibu Kandung", value: data.namaIbuKandung || "-" },
            {
              label: "Jenis Kartu ID Ibu",
              value: getKeteranganByGroupAndId("JenisID", data.jnsKartuIDIbu),
            },
            { label: "No Kartu ID Ibu", value: data.noKartuIDIbu || "-" },
            { label: "Berlaku ID Ibu", value: formatDate(data.berlakuIDIbu) },
            {
              label: "KTP Seumur Hidup Ibu",
              value: data.ktPseumurHidupIbu === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
            { label: "Tempat Lahir Ibu", value: data.tmptLahirIbu || "-" },
            { label: "Tanggal Lahir Ibu", value: formatDate(data.tglLahirIbu) },
            { label: "No HP Ibu", value: data.noHpIbu || "-" },
            { label: "No HP Ibu 2", value: data.noHpIbu2 || "-" },
            { label: "Alamat KTP Ibu", value: data.alamatKTPIbu || "-" },
            {
              label: "Alamat Domisili Ibu",
              value: data.alamatDomisiliIbu || "-",
            },
            {
              label: "Tinggal Debitur Ibu",
              value: data.tinggalDebiturIbu === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
            {
              label: "Pekerjaan Ibu",
              value: getKeteranganByGroupAndId("Pekerjaan", data.pekerjaanIbu),
            },
            { label: "Nama PT Ibu", value: data.namaPTIbu || "-" },
          ],
        },
        {
          title: "Informasi Tambahan",
          fields: [
            {
              label: "Ada SP Pisah Harta",
              value: data.adaSPisahHarta === "Y" ? "Ya" : "Tidak",
              type: "badge",
            },
            { label: "Jumlah Tanggungan", value: data.jumTanggungan || "-" },
          ],
        },
      ],
    },
  };

  // Kolom untuk table darurat
  const columnsDarurat = [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Darurat",
      dataIndex: "namaDarurat",
      key: "namaDarurat",
    },
    {
      title: "Hubungan",
      dataIndex: "hubungan",
      key: "hubungan",
    },
    {
      title: "No HP",
      dataIndex: "noHp",
      key: "noHp",
    },
    {
      title: "No Telp",
      dataIndex: "noTelp",
      key: "noTelp",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Alamat KTP",
      dataIndex: "alamatKTP",
      key: "alamatKTP",
    },
    {
      title: "Alamat Domisili",
      dataIndex: "alamatDomisili",
      key: "alamatDomisili",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
    },
    // {
    //   title: "Aksi",
    //   key: "action",
    //   render: (_, record, index) => (
    //     <Space size="middle">
    //       <Button
    //         type="link"
    //         icon={<EditOutlined />}
    //         onClick={() => handleEditDarurat(record, index)}
    //       />
    //       <Button
    //         type="link"
    //         danger
    //         icon={<DeleteOutlined />}
    //         onClick={() => handleDeleteDarurat(record.idCIFDarurat)}
    //       />
    //     </Space>
    //   ),
    // },
  ];

  // Kolom untuk table penjamin
  const columnsPenjamin = [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Penjamin",
      dataIndex: "namaPenjamin",
      key: "namaPenjamin",
    },
    {
      title: "Hubungan",
      dataIndex: "hubungan",
      key: "hubungan",
    },
    {
      title: "No HP",
      dataIndex: "noHp",
      key: "noHp",
    },
    {
      title: "No Telp",
      dataIndex: "noTelp",
      key: "noTelp",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Pekerjaan",
      dataIndex: "pekerjaan",
      key: "pekerjaan",
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan",
      key: "jabatan",
    },
    {
      title: "Alamat KTP",
      dataIndex: "alamatKTP",
      key: "alamatKTP",
    },
    {
      title: "Alamat Domisili",
      dataIndex: "alamatDomisili",
      key: "alamatDomisili",
    },
    {
      title: "Alamat Pekerjaan",
      dataIndex: "alamatPekerjaan",
      key: "alamatPekerjaan",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
    },
    // {
    //   title: "Aksi",
    //   key: "action",
    //   render: (_, record, index) => (
    //     <Space size="middle">
    //       <Button
    //         type="link"
    //         icon={<EditOutlined />}
    //         onClick={() => handleEditPenjamin(record, index)}
    //       />
    //       <Button
    //         type="link"
    //         danger
    //         icon={<DeleteOutlined />}
    //         onClick={() => handleDeletePenjamin(record.idCIFPenjamin)}
    //       />
    //     </Space>
    //   ),
    // },
  ];

  // Data untuk tab lainnya
  const lainnyaFields = [
    {
      label: "Kode Dati 1",
      value: getKeteranganByGroupAndId("Dati1", data.kdDati1),
    },
    {
      label: "Kode Group",
      value: getKeteranganByGroupAndId("Group", data.kdGrp),
    },
    {
      label: "Kode Group 2",
      value: getKeteranganByGroupAndId("Group", data.kdGrp2),
    },
    {
      label: "Kode Group 3",
      value: getKeteranganByGroupAndId("Group", data.kdGrp3),
    },
    {
      label: "Kode Gol",
      value: getKeteranganByGroupAndId("Golongan", data.kdGol),
    },
    {
      label: "Kode Gol SLIK",
      value: getKeteranganByGroupAndId("GolSLIK", data.kdGol_SLIK),
    },
    {
      label: "Kode Gol Nasabah",
      value: getKeteranganByGroupAndId("SGOLDEB", data.kdGOL_Nasabah),
    },
    {
      label: "Mutlak Kena Pajak",
      value: data.mutlakKenaPajak === "Y" ? "Ya" : "Tidak",
      type: "badge",
    },
    { label: "No Urut Fasilitas", value: data.noUrutFasilitas || "-" },
    {
      label: "Upload 2 Konsol",
      value: data.upload2Konsol ? "Ya" : "Tidak",
      type: "badge",
    },
    {
      label: "Is Blokir Tab",
      value: data.isBlokirTab ? "Ya" : "Tidak",
      type: "badge",
    },
    {
      label: "CIF Warning",
      value: data.cIFwarning ? "Ya" : "Tidak",
      type: "badge",
    },
    {
      label: "Is Perbankan",
      value: data.isPerbankan === "Y" ? "Ya" : "Tidak",
      type: "badge",
    },
    { label: "No CIF Lama", value: data.noCIFlama || "-" },
    {
      label: "Struktur Pemilik",
      value: getKeteranganByGroupAndId(
        "KodeStrukturPemilik",
        data.strukturPemilik
      ),
    },
    {
      label: "Info Negatif",
      value: getKeteranganByGroupAndId("KodeInfoNegatif", data.infoNegatif),
    },
    {
      label: "Rek Koran By Email",
      value: data.rekKoranByEmail ? "Ya" : "Tidak",
      type: "badge",
    },
    {
      label: "CIF Perbankan",
      value: data.isPerbankan === "Y" ? "Ya" : "Tidak",
      type: "badge",
    },
    { label: "Foto", value: data.foto || "-" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            type="text"
            size="small"
            onClick={onBack}
            icon={<ArrowLeftOutlined />}
            className="flex items-center gap-2"
          >
            Kembali
          </Button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <UserOutlined className="text-blue-600 text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Detail CIF</h1>
              <p className="text-gray-500 text-lg mt-1">
                {data?.nama} -{" "}
                <span className="font-semibold text-blue-600">
                  {data?.noCIF}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="umum" className="w-full" tabPosition="top">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              <span className="hidden sm:inline ml-2">Data Umum</span>
            </span>
          }
          key="umum"
        >
          {tabData.umum.sections.map((section, sectionIndex) => (
            <FieldSection
              key={sectionIndex}
              title={section.title}
              fields={section.fields}
              columns={section.fields.length > 8 ? 3 : 2}
            />
          ))}
        </TabPane>

        <TabPane
          tab={
            <span>
              <UserOutlined />
              <span className="hidden sm:inline ml-2">Perorangan</span>
            </span>
          }
          key="perorangan"
        >
          {tabData.perorangan.sections.map((section, sectionIndex) => (
            <FieldSection
              key={sectionIndex}
              title={section.title}
              fields={section.fields}
              columns={section.fields.length > 8 ? 3 : 2}
            />
          ))}
        </TabPane>

        <TabPane
          tab={
            <span>
              <BankOutlined />
              <span className="hidden sm:inline ml-2">Usaha</span>
            </span>
          }
          key="usaha"
        >
          {tabData.usaha.sections.map((section, sectionIndex) => (
            <FieldSection
              key={sectionIndex}
              title={section.title}
              fields={section.fields}
              columns={section.fields.length > 8 ? 3 : 2}
            />
          ))}
        </TabPane>

        <TabPane
          tab={
            <span>
              <TeamOutlined />
              <span className="hidden sm:inline ml-2">Keluarga</span>
            </span>
          }
          key="keluarga"
        >
          {tabData.keluarga.sections.map((section, sectionIndex) => (
            <FieldSection
              key={sectionIndex}
              title={section.title}
              fields={section.fields}
              columns={section.fields.length > 8 ? 3 : 2}
            />
          ))}
        </TabPane>

        <TabPane
          tab={
            <span>
              <PhoneOutlined />
              <span className="hidden sm:inline ml-2">Darurat</span>
            </span>
          }
          key="darurat"
        >
          <Card
            title={
              <span className="flex items-center">
                <PhoneOutlined className="mr-2" />
                Daftar Kontak Darurat
              </span>
            }
            className="mb-6"
          >
            <Table
              columns={columnsDarurat}
              dataSource={
                data?.cifDarurat?.map((item, index) => ({
                  ...item,
                  key: item.idCIFDarurat || index,
                  index: index + 1,
                })) || []
              }
              pagination={false}
              locale={{
                emptyText: "Tidak ada data kontak darurat",
              }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              <span className="hidden sm:inline ml-2">Penjamin</span>
            </span>
          }
          key="penjamin"
        >
          <Card
            title={
              <span className="flex items-center">
                <FileTextOutlined className="mr-2" />
                Daftar Data Penjamin
              </span>
            }
            className="mb-6"
          >
            <Table
              columns={columnsPenjamin}
              dataSource={
                data?.cifPenjamin?.map((item, index) => ({
                  ...item,
                  key: item.idCIFPenjamin || index,
                  index: index + 1,
                })) || []
              }
              pagination={false}
              locale={{
                emptyText: "Tidak ada data penjamin",
              }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <MoreOutlined />
              <span className="hidden sm:inline ml-2">Lainnya</span>
            </span>
          }
          key="lainnya"
        >
          <FieldSection
            title="Informasi Lainnya"
            fields={lainnyaFields}
            columns={3}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PendataanCIF;
