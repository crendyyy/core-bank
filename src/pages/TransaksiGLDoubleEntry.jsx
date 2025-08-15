import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Tooltip,
  message,
  Switch,
  Descriptions,
  Flex,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  FilterFilled,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetAllCoa,
  useGetAllGLDoubleEntry,
} from "../service/GLJournalDoubleEnt/UseGetGLJournal";
import { useCreateGLDoubleEntry } from "../service/GLJournalDoubleEnt/useCreateGLJournal";
import {
  usePostingGLDoubleEntry,
  useUpdateGLDoubleEntry,
} from "../service/GLJournalDoubleEnt/useUpdateGLJournal";
import { useDeleteGLDoubleEntry } from "../service/GLJournalDoubleEnt/useDeleteGLJournal";
import { useUserContext } from "../components/context/userContext";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TransaksiGLDoubleEntry = () => {
  const { user } = useUserContext();
  const [form] = Form.useForm();
  const addButtonRef = useRef(null);
  const coaSelectRefs = useRef([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create"); // 'create', 'edit', 'view'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailEntries, setDetailEntries] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalKredit, setTotalKredit] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const searchInput = useRef(null);

  const [queryParams, setQueryParams] = useState({
    limit: 5,
    page: 1,
    sort: null,
    search: {
      start_date: null,
      end_date: null,
      NoRef: null,
      Posting: null,
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

  const { data: GLDoubleEntry, isPending: isGLDoubleEntryLoading } =
    useGetAllGLDoubleEntry(transformQueryParams());
  const { data: COA, isPending: isCOALoading } = useGetAllCoa();
  const createGLDoubleEntryMutation = useCreateGLDoubleEntry();
  const updateGLDoubleEntryMutation = useUpdateGLDoubleEntry();
  const postingGLDoubleEntryMutation = usePostingGLDoubleEntry();
  const deleteGLDoubleEntryMutation = useDeleteGLDoubleEntry();

  // Calculate totals whenever detail entries change
  useEffect(() => {
    const debit = detailEntries.reduce(
      (sum, entry) => sum + (parseFloat(entry.debet) || 0),
      0
    );
    const kredit = detailEntries.reduce(
      (sum, entry) => sum + (parseFloat(entry.kredit) || 0),
      0
    );

    setTotalDebit(debit);
    setTotalKredit(kredit);
  }, [detailEntries]);

  const isBalanced = totalDebit === totalKredit && totalDebit > 0;

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

  // Table columns - Tambahkan semua field yang ada
  const columns = [
    {
      title: "No",
      key: "#",
      width: 40,
      render: (_, __, index) => index + 1,
      fixed: "left",
      align: "center",
    },
    {
      title: "No. Referensi",
      dataIndex: "noRef",
      key: "noRef",
      ...getColumnSearchProps("noRef"),
      sorter: true,
      width: 140,
      render: (text) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
      fixed: "left",
    },
    {
      title: "Tanggal",
      dataIndex: "tgTrans",
      key: "tgTrans",
      width: 100,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Nominal",
      dataIndex: "nominal",
      key: "nominal",
      sorter: true,
      width: 120,
      align: "right",
      render: (value) => (
        <Text strong style={{ color: "#52c41a" }}>
          Rp {parseInt(value).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "posting",
      key: "posting",
      width: 200,
      filters: [
        {
          text: "Posting",
          value: "Y",
        },
        {
          text: "Draft",
          value: "T",
        },
      ],
      sorter: true,
      filterMultiple: true,
      filterIcon: (filtered) => (
        <FilterFilled style={{ color: filtered ? "#34A853" : "#A9A9A9" }} />
      ),
      align: "center",
      render: (status) => (
        <Tag
          color={status === "Y" ? "green" : "orange"}
          icon={status === "Y" ? <CheckOutlined /> : <CloseOutlined />}
        >
          {status === "Y" ? "Posting" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "keteranganTransaksi",
      key: "keteranganTransaksi",
      width: 200,
      ...getColumnSearchProps("keteranganTransaksi"),
      sorter: true,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || "-"}
        </Tooltip>
      ),
    },
    {
      title: "Dibuat Oleh",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tgl Dibuat",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date) => (date ? dayjs(date).format("DD/MM/YY") : "-"),
    },
    {
      title: "Diupdate Oleh",
      dataIndex: "updatedBy",
      key: "updatedBy",
      width: 100,
      render: (text) => (text ? <Tag color="orange">{text}</Tag> : "-"),
    },
    {
      title: "Tgl Update",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 100,
      render: (date) => (date ? dayjs(date).format("DD/MM/YY") : "-"),
    },
    {
      title: "Disetujui Oleh",
      dataIndex: "approvedBy",
      key: "approvedBy",
      width: 100,
      render: (text) => (text ? <Tag color="green">{text}</Tag> : "-"),
    },
    {
      title: "Tgl Approval",
      dataIndex: "approvedAt",
      key: "approvedAt",
      width: 100,
      render: (date) => (date ? dayjs(date).format("DD/MM/YY") : "-"),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
              disabled={record.posting === "Y"}
            />
          </Tooltip>
          <Tooltip title="Hapus">
            <Popconfirm
              title="Hapus Transaksi"
              description="Apakah Anda yakin ingin menghapus transaksi ini?"
              onConfirm={() => handleDelete(record)}
              disabled={record.posting === "Y"}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={record.posting === "Y"}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Detail journal columns
  const detailColumns = [
    {
      title: "Kode COA",
      dataIndex: "accCode",
      key: "accCode",
      width: 120,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "Debit",
      dataIndex: "debet",
      key: "debet",
      width: 130,
      align: "right",
      render: (value) => (
        <Text strong style={{ color: value > 0 ? "#1890ff" : "#d9d9d9" }}>
          {value > 0 ? `Rp ${parseInt(value).toLocaleString("id-ID")}` : "-"}
        </Text>
      ),
    },
    {
      title: "Kredit",
      dataIndex: "kredit",
      key: "kredit",
      width: 130,
      align: "right",
      render: (value) => (
        <Text strong style={{ color: value > 0 ? "#52c41a" : "#d9d9d9" }}>
          {value > 0 ? `Rp ${parseInt(value).toLocaleString("id-ID")}` : "-"}
        </Text>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      ellipsis: true,
    },
    ...(modalType !== "view"
      ? [
          {
            title: "Aksi",
            key: "action",
            width: 60,
            render: (_, record, index) => (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDeleteDetailEntry(index)}
              />
            ),
          },
        ]
      : []),
  ];

  const handleCreate = () => {
    setModalType("create");
    setSelectedRecord(null);
    setDetailEntries([]);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      posting: false, // Default T (false)
      idTrans: "0000",
      idProduk: "90",
      upload2Konsol: false,
    });
    setIsModalVisible(true);
    setIsChecked(false);
  };

  const handleEdit = (record) => {
    setModalType("edit");
    setSelectedRecord(record);

    // Konversi format lama ke format baru
    const convertedEntries =
      record.detailJournal?.map((entry) => ({
        accCode: entry.accCode,
        debet: entry.tipe === "D" ? parseFloat(entry.nominal) : 0,
        kredit: entry.tipe === "K" ? parseFloat(entry.nominal) : 0,
        keterangan: entry.keterangan,
      })) || [];

    setDetailEntries(convertedEntries);

    form.setFieldsValue({
      kodeBank: record.kodeBank,
      tgTrans: dayjs(record.tgTrans),
      idTrans: record.idTrans || "0000",
      posting: record.posting === "Y",
      idProduk: record.idProduk || "90",
      upload2Konsol: record.upload2Konsol || false,
      keteranganTransaksi: record.keteranganTransaksi,
    });
    setIsModalVisible(true);
    setIsChecked(false);
  };

  const handleView = (record) => {
    setModalType("view");
    setSelectedRecord(record);

    // Konversi format lama ke format baru untuk view
    const convertedEntries =
      record.detailJournal?.map((entry) => ({
        accCode: entry.accCode,
        debet: entry.tipe === "D" ? parseFloat(entry.nominal) : 0,
        kredit: entry.tipe === "K" ? parseFloat(entry.nominal) : 0,
        keterangan: entry.keterangan,
      })) || [];

    setDetailEntries(convertedEntries);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    console.log(record);

    deleteGLDoubleEntryMutation.mutate(record.noRef);
  };

  const handleAddDetailEntry = () => {
    const newEntry = {
      accCode: "",
      debet: 0,
      kredit: 0,
      keterangan: "",
    };
    setDetailEntries([...detailEntries, newEntry]);
  };

  const handleDebetChange = (index, value) => {
    const newEntries = [...detailEntries];
    newEntries[index] = {
      ...newEntries[index],
      debet: value || 0,
      kredit: 0, // Reset kredit ketika debet diisi
    };
    setDetailEntries(newEntries);
  };

  const handleKreditChange = (index, value) => {
    const newEntries = [...detailEntries];
    newEntries[index] = {
      ...newEntries[index],
      kredit: value || 0,
      debet: 0, // Reset debet ketika kredit diisi
    };
    setDetailEntries(newEntries);
  };

  const handleDeleteDetailEntry = (index) => {
    const newEntries = detailEntries.filter((_, i) => i !== index);
    setDetailEntries(newEntries);
  };

  const handleDetailEntryChange = (index, field, value) => {
    const newEntries = [...detailEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setDetailEntries(newEntries);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.posting === "Y", // Disable checkbox untuk yang sudah posted
      name: record.noRef,
    }),
  };

  const handlePosting = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Pilih minimal satu transaksi untuk diposting!");
      return;
    }

    Modal.confirm({
      title: "Konfirmasi Posting",
      content: `Apakah Anda yakin ingin memposting ${selectedRowKeys.length} transaksi yang dipilih?`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          selectedRowKeys.forEach((noRef) => {
            postingGLDoubleEntryMutation.mutate(noRef);
          });
          setSelectedRowKeys([]); // Reset selection
        } finally {
          message.success("Pilih minimal satu transaksi untuk diposting!");
        }
      },
    });
  };

  const handleCOACodeChange = (index, value) => {
    const selectedCOA = COA?.data?.find((coa) => coa.coaCode === value);
    if (selectedCOA) {
      // Update field accCode
      handleDetailEntryChange(index, "accCode", selectedCOA.coaCode);
      // Jika ada field terpisah untuk nama, update juga
      if (entry.accName !== undefined) {
        handleDetailEntryChange(index, "accName", selectedCOA.coaName);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!isBalanced) {
        message.error("Total debit dan kredit harus seimbang!");
        return;
      }

      if (detailEntries.length < 2) {
        message.error("Minimal harus ada 2 entry jurnal!");
        return;
      }

      // Konversi format baru ke format API
      const convertedDetailJournal = detailEntries.map((entry) => ({
        AccCode: entry.accCode,
        Tipe: entry.debet > 0 ? "D" : "K",
        Nominal: (entry.debet > 0 ? entry.debet : entry.kredit).toString(),
        Keterangan: entry.keterangan,
      }));

      const payload = {
        KodeBank: user?.kdBank,
        TgTrans: values.tgTrans.format("YYYY-MM-DDTHH:mm:ss"),
        IdTrans: values.idTrans,
        Posting: values.posting ? "Y" : "T",
        IdProduk: values.idProduk,
        Upload2Konsol: values.upload2Konsol,
        KeteranganTransaksi: values.keteranganTransaksi || "",
        DetailJournal: convertedDetailJournal,
      };

      if (modalType === "create") {
        createGLDoubleEntryMutation.mutate(payload);
      } else if (modalType === "edit") {
        updateGLDoubleEntryMutation.mutate({
          id: selectedRecord.noRef,
          data: payload,
        });
      }

      setIsModalVisible(false);
      setIsChecked(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setDetailEntries([]);
    setSelectedRecord(null);
    setIsChecked(false);
  };

  // Focus pada COA field dari entry baru
  useEffect(() => {
    if (detailEntries.length > 0) {
      const lastIndex = detailEntries.length - 1;
      const lastEntry = detailEntries[lastIndex];

      // Jika entry terakhir adalah entry baru (kosong), fokus ke COA field
      if (!lastEntry.accCode && coaSelectRefs.current[lastIndex]) {
        setTimeout(() => {
          coaSelectRefs.current[lastIndex]?.focus();
        }, 100);
      }
    }
  }, [detailEntries.length]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter untuk add entry baru
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleAddDetailEntry();
      }

      // Escape untuk focus ke add button
      if (e.key === "Escape") {
        e.preventDefault();
        addButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleAddDetailEntry]);

  const handleAddEntryWithFocus = () => {
    handleAddDetailEntry();
    // Focus akan ditangani oleh useEffect di atas
  };

  // Enhanced delete handler dengan focus ke add button
  const handleDeleteEntryWithFocus = (index) => {
    handleDeleteDetailEntry(index);
    setTimeout(() => {
      addButtonRef.current?.focus();
    }, 100);
  };

  // Handle Enter key pada COA select untuk pindah ke field berikutnya
  const handleCOAKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Pindah ke debit field jika credit kosong, atau ke credit field jika debit kosong
      const entry = detailEntries[index];
      if (
        entry.kredit === 0 ||
        entry.kredit === null ||
        entry.kredit === undefined
      ) {
        // Focus ke debit field
        document.querySelector(`[data-debit-index="${index}"]`)?.focus();
      } else {
        // Focus ke credit field
        document.querySelector(`[data-credit-index="${index}"]`)?.focus();
      }
    }
  };

  return (
    <Card>
      <Flex vertical justify="space-between" align="start" gap={16}>
        <div>
          <Title style={{ margin: 0 }} level={2}>
            Transaksi GL Double Entry
          </Title>
          <Text className="text-gray-500 mt-1">
            Kelola transaksi jurnal umum dengan sistem double entry
          </Text>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 w-full mb-4">
          <Flex justify="space-between" align="center">
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Tambah Transaksi
              </Button>

              {selectedRowKeys.length > 0 && (
                <Button
                  type="default"
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    color: "white",
                  }}
                  icon={<CheckOutlined />}
                  onClick={handlePosting}
                  loading={postingGLDoubleEntryMutation.isPending}
                >
                  Posting ({selectedRowKeys.length})
                </Button>
              )}
              <DatePicker.RangePicker
                placeholder={["Tanggal Mulai", "Tanggal Selesai"]}
                style={{ width: 280 }}
                value={[
                  queryParams.search.start_date
                    ? dayjs(queryParams.search.start_date)
                    : null,
                  queryParams.search.end_date
                    ? dayjs(queryParams.search.end_date)
                    : null,
                ]}
                onChange={(dates) => {
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
                allowClear
              />
            </Space>

            <Space>
              {selectedRowKeys.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedRowKeys.length} transaksi dipilih
                </span>
              )}
              <span className="text-sm text-gray-500">
                Total:{" "}
                <span className="font-medium">
                  {GLDoubleEntry?.data?.length || 0} Transaksi
                </span>
              </span>
            </Space>
          </Flex>
        </div>
      </Flex>

      <Table
        columns={columns}
        dataSource={GLDoubleEntry?.data || []}
        loading={isGLDoubleEntryLoading}
        rowKey="noRef"
        rowSelection={rowSelection}
        onChange={handleTableChange}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50", "100"],
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: GLDoubleEntry?.total || 0,
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
        scroll={{ x: "max-content" }}
        size="middle"
        bordered
      />

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            {modalType === "create" && (
              <PlusOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
            )}
            {modalType === "edit" && (
              <EditOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            )}
            {modalType === "view" && (
              <EyeOutlined
                style={{ marginRight: "8px" }}
                className="!text-primary"
              />
            )}
            {modalType === "create"
              ? "Tambah Transaksi Baru"
              : modalType === "edit"
              ? "Edit Transaksi"
              : "Detail Transaksi"}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        centered
        styles={{
          body: { padding: "24px", maxHeight: "80vh", overflowY: "auto" },
        }}
        width={1200}
        footer={
          modalType === "view" ? (
            <Button onClick={handleCancel} size="large">
              Tutup
            </Button>
          ) : (
            <Space>
              <Button onClick={handleCancel} size="large">
                Batal
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={
                  createGLDoubleEntryMutation.isPending ||
                  updateGLDoubleEntryMutation.isPending
                }
                disabled={!isBalanced}
                size="large"
                style={{ minWidth: "100px" }}
              >
                {modalType === "create" ? "Simpan" : "Update"}
              </Button>
            </Space>
          )
        }
      >
        {modalType === "view" ? (
          // View Mode - Display all data
          <div>
            <Descriptions title="Informasi Transaksi" bordered column={2}>
              <Descriptions.Item label="No. Referensi">
                {selectedRecord?.noRef}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Transaksi">
                {dayjs(selectedRecord?.tgTrans).format("DD MMMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Total Nominal">
                <Text strong style={{ color: "#52c41a" }}>
                  Rp{" "}
                  {parseInt(selectedRecord?.nominal || 0).toLocaleString(
                    "id-ID"
                  )}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={selectedRecord?.posting === "Y" ? "green" : "orange"}
                >
                  {selectedRecord?.posting === "Y" ? "Posted" : "Draft"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Keterangan" span={2}>
                {selectedRecord?.keteranganTransaksi || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat Oleh">
                {selectedRecord?.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Dibuat">
                {selectedRecord?.createdAt
                  ? dayjs(selectedRecord.createdAt).format("DD/MM/YYYY HH:mm")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Diupdate Oleh">
                {selectedRecord?.updatedBy || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Update">
                {selectedRecord?.updatedAt
                  ? dayjs(selectedRecord.updatedAt).format("DD/MM/YYYY HH:mm")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Disetujui Oleh">
                {selectedRecord?.approvedBy || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Approval">
                {selectedRecord?.approvedAt
                  ? dayjs(selectedRecord.approvedAt).format("DD/MM/YYYY HH:mm")
                  : "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="center">Detail Jurnal</Divider>
            <Table
              columns={detailColumns}
              dataSource={detailEntries}
              pagination={false}
              size="small"
              bordered
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong style={{ color: "#1890ff" }}>
                        Rp {totalDebit.toLocaleString("id-ID")}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong style={{ color: "#52c41a" }}>
                        Rp {totalKredit.toLocaleString("id-ID")}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    {modalType !== "view" && (
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                    )}
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
        ) : (
          // Create/Edit Mode - Form
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={20}>
                <Form.Item
                  label="Tanggal Transaksi"
                  name="tgTrans"
                  rules={[
                    {
                      required: true,
                      message: "Tanggal transaksi wajib diisi!",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Pilih tanggal"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Status Posting"
                  name="posting"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Posting"
                    unCheckedChildren="Draft"
                    checked={isChecked}
                    onChange={(checked) => setIsChecked(checked)}
                    className={isChecked ? "!bg-[#52c41a]" : ""}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Keterangan Transaksi" name="keteranganTransaksi">
              <TextArea
                rows={3}
                placeholder="Masukkan keterangan transaksi..."
              />
            </Form.Item>

            <Divider>Detail Jurnal</Divider>

            {/* New Table Format for Journal Entries */}
            <div className="mb-4">
              {/* Header */}
              <div className="grid grid-cols-[60px_150px_200px_130px_130px_200px_60px] gap-2 items-center p-3 bg-gray-50 rounded-md border border-gray-200 font-medium">
                <div className="text-center">No</div>
                <div className="col-span-2">Kode COA</div>
                <div className="text-center">Debit</div>
                <div className="text-center">Kredit</div>
                <div>Keterangan</div>
                <div>Aksi</div>
              </div>

              {/* Entry Rows */}
              {detailEntries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[60px_150px_200px_130px_130px_200px_60px] gap-2 items-center p-3 bg-white rounded-md border border-gray-200 mt-2 hover:shadow-sm transition-shadow"
                >
                  {/* No */}
                  <div className="text-center font-medium text-gray-600">
                    {index + 1}
                  </div>

                  {/* COA Code */}
                  <Select
                    ref={(el) => (coaSelectRefs.current[index] = el)}
                    showSearch
                    placeholder="Pilih atau ketik kode COA"
                    className="col-span-2"
                    value={entry.accCode}
                    onChange={(value) => handleCOACodeChange(index, value)}
                    onKeyDown={(e) => handleCOAKeyDown(e, index)}
                    loading={isCOALoading}
                    filterOption={(input, option) =>
                      option?.value
                        ?.toLowerCase()
                        .includes(input.toLowerCase()) ||
                      option?.label?.toLowerCase().includes(input.toLowerCase())
                    }
                    options={COA?.data?.map((coa) => ({
                      value: coa.coaCode,
                      label: `${coa.coaCode} - ${coa.coaName}`,
                    }))}
                  />

                  {/* Debit */}
                  <InputNumber
                    data-debit-index={index}
                    className="w-full"
                    value={entry.debet}
                    onChange={(value) => handleDebetChange(index, value)}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    placeholder="0"
                    min={0}
                    disabled={entry.kredit > 0}
                    size="middle"
                    onPressEnter={(e) => {
                      // Pindah ke description field
                      document
                        .querySelector(`[data-desc-index="${index}"]`)
                        ?.focus();
                    }}
                  />

                  {/* Credit */}
                  <InputNumber
                    data-credit-index={index}
                    className="w-full"
                    value={entry.kredit}
                    onChange={(value) => handleKreditChange(index, value)}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    placeholder="0"
                    min={0}
                    disabled={entry.debet > 0}
                    size="middle"
                    onPressEnter={(e) => {
                      // Pindah ke description field
                      document
                        .querySelector(`[data-desc-index="${index}"]`)
                        ?.focus();
                    }}
                  />

                  {/* Description */}
                  <Input
                    data-desc-index={index}
                    value={entry.keterangan}
                    onChange={(e) =>
                      handleDetailEntryChange(
                        index,
                        "keterangan",
                        e.target.value
                      )
                    }
                    placeholder="Description"
                    size="middle"
                    onPressEnter={(e) => {
                      // Jika ini entry terakhir, tambah entry baru
                      if (index === detailEntries.length - 1) {
                        handleAddEntryWithFocus();
                      } else {
                        // Pindah ke COA field entry berikutnya
                        coaSelectRefs.current[index + 1]?.focus();
                      }
                    }}
                  />

                  {/* Delete Button */}
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteEntryWithFocus(index)}
                    size="middle"
                    className="flex items-center justify-center w-8 h-8 hover:bg-red-50"
                    title="Delete entry (atau tekan Escape untuk focus add button)"
                  />
                </div>
              ))}

              {/* Add New Entry Row */}
              <div className="grid grid-cols-[60px_150px_200px_130px_130px_200px_60px] gap-2 items-center p-3 bg-green-50 rounded-md border border-green-200 border-dashed mt-2">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <Button
                  ref={addButtonRef}
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddEntryWithFocus}
                  size="middle"
                  className="!bg-green-500 hover:!bg-green-600 !border-green-500 hover:!border-green-600 w-8 h-8 flex items-center justify-center"
                  title="Add new entry (Ctrl/Cmd + Enter)"
                />
              </div>
            </div>

            {/* Balance Summary */}
            {detailEntries.length > 0 && (
              <Card
                size="small"
                style={{
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #d9d9d9",
                  marginTop: "16px",
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space size="large">
                      <div>
                        <Text strong>Total Debit: </Text>
                        <Text
                          style={{
                            color: "#1890ff",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          Rp {totalDebit.toLocaleString("id-ID")}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Total Kredit: </Text>
                        <Text
                          style={{
                            color: "#52c41a",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          Rp {totalKredit.toLocaleString("id-ID")}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <div style={{ textAlign: "right" }}>
                      <Text strong>Status Balance: </Text>
                      {isBalanced ? (
                        <Tag
                          color="success"
                          icon={<CheckOutlined />}
                          style={{ fontSize: "14px", padding: "4px 12px" }}
                        >
                          Seimbang
                        </Tag>
                      ) : (
                        <Tag
                          color="error"
                          icon={<ExclamationCircleOutlined />}
                          style={{ fontSize: "14px", padding: "4px 12px" }}
                        >
                          Tidak Seimbang
                        </Tag>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {!isBalanced && detailEntries.length > 0 && (
              <Alert
                message="Peringatan Balance"
                description={`Total debit (Rp ${totalDebit.toLocaleString(
                  "id-ID"
                )}) dan total kredit (Rp ${totalKredit.toLocaleString(
                  "id-ID"
                )}) harus seimbang sebelum menyimpan transaksi.`}
                type="warning"
                showIcon
                style={{ marginTop: "16px" }}
              />
            )}
          </Form>
        )}
      </Modal>
    </Card>
  );
};

export default TransaksiGLDoubleEntry;
