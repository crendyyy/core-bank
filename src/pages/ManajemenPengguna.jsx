import Title from "antd/es/typography/Title";
import { useState, useEffect } from "react";
import { useGetAllUser } from "../service/userServices/useGetAllUser";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Select,
  message,
  Input,
  Card,
  Tooltip,
  Form,
  Flex,
  Switch,
  Row,
  Col,
  InputNumber,
  Badge,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useGetRoles } from "../service/roles/useGetRoles";
import { useAssignRolesUser } from "../service/userServices/useAssignRoleUser";
import { useDeleteRolesUser } from "../service/userServices/useDeleteRoleUser";
import usePermitValidation from "../hooks/usePermitValidation";
import PermitModal from "../components/modal/PermitModal";
import { useCreateUser } from "../service/userServices/useCreateUser";
import { useUpdateUser } from "../service/userServices/useUpdateUser";
import {
  useGetBranch,
  useGetCodeBank,
} from "../service/codeBank/useGetCodeBank";
import ManajemenUserModal from "../components/modal/ManajemenUserModal";

const { Option } = Select;

const ManajemenRolePengguna = () => {
  const [formPermit] = Form.useForm();
  const [formUser] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { data: usersData } = useGetAllUser();
  const { data: roles } = useGetRoles();
  const { data: codeBankData, loading: codeBankLoading } = useGetBranch();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  console.log(usersData);

  const {
    validatePermission,
    isPermitModalOpen,
    closePermitModal,
    handlePermitSubmit,
    contextHolder,
  } = usePermitValidation({ alwaysRequirePermit: true });

  const assignRole = () => {
    validatePermission({
      type: "add",
      actionName: "CanCreate",
      onSuccess: () => {
        // Update user dengan role baru
        const currentRoles = selectedUser.roles.map((role) => role.roleId);
        const newRoles = [...currentRoles, ...selectedRole];

        updateUserMutation.mutate({
          id: selectedUser.userId,
          data: { roleIds: newRoles },
        });

        setSelectedUser(null);
        setSelectedRole(null);
        formPermit.resetFields();
      },
    });
  };

  const removeRole = (user, roleId) => {
    validatePermission({
      type: "delete",
      actionName: "CanDelete",
      data: { userId: user.userId, roleId },
      onSuccess: () => {
        // Update user dengan role yang tersisa
        const remainingRoles = user.roles
          .filter((role) => role.roleId !== roleId)
          .map((role) => role.roleId);

        updateUserMutation.mutate({
          id: user.userId,
          data: { roleIds: remainingRoles },
        });

        formPermit.resetFields();
      },
    });
  };

  const removeBranch = (user, cabangId) => {
    validatePermission({
      type: "delete",
      actionName: "CanDelete",
      data: { userId: user.userId, cabangId },
      onSuccess: () => {
        // Update user dengan role yang tersisa
        const remainingBranchs = user.kodeCabang
          .filter((cabang) => cabang.idCabang !== cabangId)
          .map((cabang) => cabang.idCabang);

        updateUserMutation.mutate({
          id: user.userId,
          data: { cabangIds: remainingBranchs },
        });

        formPermit.resetFields();
      },
    });
  };

  const handleCreateUser = () => {
    setEditMode(false);
    setIsUserModalVisible(true);
    formUser.resetFields();
  };

  const handleEditUser = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    setIsUserModalVisible(true);
    formUser.setFieldsValue({
      userId: user.userId,
      userNm: user.userNm,
      limit: user.limit,
      kodeBank: user.kodeBank,
      nik: user.nik,
      roleIds: user.roles.map((role) => role.roleId),
    });
  };

  const handleUserSubmit = (values) => {
    const userData = {
      userId: values.userId,
      userNm: values.userNm,
      limit: values.limit.toString(),
      nik: values.nik,
      roleIds: values.roleIds || [],
      CabangIds: values.kodeBank || [],
    };

    if (editMode) {
      validatePermission({
        type: "edit",
        actionName: "CanUpdate",
        onSuccess: () => {
          if (values.password && values.newPassword) {
            userData.passwordLama = values.password;
            userData.passwordBaru = values.newPassword;
          }

          updateUserMutation.mutate({
            id: selectedUser.userId,
            data: userData,
          });
        },
      });
    } else {
      validatePermission({
        type: "add",
        actionName: "CanCreate",
        onSuccess: () => {
          userData.Password = values.password || "0";
          createUserMutation.mutate(userData);
        },
      });
    }

    setIsUserModalVisible(false);
    setSelectedUser(null);
    formPermit.resetFields();
    formUser.resetFields();
  };

  const closeModal = () => {
    closePermitModal();
    formPermit.resetFields();
  };

  useEffect(() => {
    if (usersData) {
      setUsers(usersData?.data);
      setFilteredUsers(usersData?.data);
    }
  }, [usersData]);

  const handleSearch = (value) => {
    const filtered = users.filter(
      (user) =>
        user.userId.toLowerCase().includes(value.toLowerCase()) ||
        user.userNm.toLowerCase().includes(value.toLowerCase()) ||
        (user.roles.length &&
          user.roles.some((role) =>
            role.roleName.toLowerCase().includes(value.toLowerCase())
          ))
    );
    console.log(filtered);

    setFilteredUsers(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      sorter: (a, b) => a.userId.localeCompare(b.userId),
    },
    {
      title: "Nama Pengguna",
      dataIndex: "userNm",
      key: "userNm",
      sorter: (a, b) => a.userNm.localeCompare(b.userNm),
    },
    {
      title: "Limit",
      dataIndex: "limit",
      key: "limit",
      render: (limit) => (
        <span className="font-medium text-green-600">
          {formatCurrency(parseInt(limit))}
        </span>
      ),
      sorter: (a, b) => parseInt(a.limit) - parseInt(b.limit),
    },
    {
      title: "Kode Bank",
      dataIndex: "kodeBank",
      key: "kodeBank",
      width: 300,
      render: (_, record) => {
        return (
          <>
            {record.kodeCabang.length > 0 ? (
              <Space wrap>
                {record.kodeCabang.map((kdcab) => (
                  <Tag
                    color="orange"
                    key={`${record.userId}-${kdcab.idCabang}`}
                    closable
                    className="border !rounded-lg"
                    onClose={(e) => {
                      e.preventDefault();
                      Modal.confirm({
                        title: "Konfirmasi",
                        content: `Apakah Anda yakin ingin menghapus kodeBank ${kdcab.kodeBank} dari pengguna ${record.userNm}?`,
                        okText: "Ya",
                        cancelText: "Tidak",
                        onOk: () => {
                          removeBranch(record, kdcab.idCabang);
                          formPermit.resetFields();
                        },
                      });
                    }}
                  >
                    {kdcab.kodeBank}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span className="text-gray-400">
                Tidak memiliki Hak Akses Cabang
              </span>
            )}
          </>
        );
      },
    },
    {
      title: "NIK",
      dataIndex: "nik",
      key: "nik",
      render: (nik) => <span>{nik !== "" ? nik : "-"}</span>,
    },
    {
      title: "Status",
      dataIndex: "aktif",
      key: "aktif",
      render: (aktif) => (
        <Badge
          status={aktif === "Y" ? "success" : "error"}
          text={aktif === "Y" ? "Aktif" : "Tidak Aktif"}
        />
      ),
    },
    {
      title: "Roles",
      key: "roles",
      render: (_, record) => {
        return (
          <>
            {record.roles.length > 0 ? (
              <Space wrap>
                {record.roles.map((role) => (
                  <Tag
                    color="blue"
                    key={`${record.userId}-${role.roleId}`}
                    closable
                    className="border !rounded-lg"
                    onClose={(e) => {
                      e.preventDefault();
                      Modal.confirm({
                        title: "Konfirmasi",
                        content: `Apakah Anda yakin ingin menghapus role ${role.roleName} dari pengguna ${record.userNm}?`,
                        okText: "Ya",
                        cancelText: "Tidak",
                        onOk: () => {
                          removeRole(record, role.roleId);
                          formPermit.resetFields();
                        },
                      });
                    }}
                  >
                    {role.roleName}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span className="text-gray-400">Tidak memiliki role</span>
            )}
          </>
        );
      },
      width: 300,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Flex align="center" gap={8}>
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            className="border !rounded-lg"
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Switch
            checked={record.aktif === "Y"}
            size="small"
            onChange={(checked) => {
              validatePermission({
                type: "edit",
                actionName: "CanUpdate",
                onSuccess: () => {
                  updateUserMutation.mutate({
                    id: record.userId,
                    data: { aktif: checked ? "Y" : "N" },
                  });
                },
              });
              formPermit.resetFields();
            }}
          />
        </Flex>
      ),
      width: 200,
      fixed: "right",
    },
  ];

  return (
    <>
      {contextHolder}
      <PermitModal
        isModalOpen={isPermitModalOpen}
        handleCancel={closeModal}
        onFinish={handlePermitSubmit}
        form={formPermit}
      />
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="mb-2">
              Manajemen Pengguna
            </Title>
            <p className="text-gray-500">
              Kelola pengguna dan hak akses dengan menambahkan atau menghapus
              role.
            </p>
          </div>
        </div>
        {/* Header Actions */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 w-full mb-4">
          <Row justify="space-between" align="middle">
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUser}
              >
                Tambah Pengguna
              </Button>
            </Col>
            <Col>
              <Input.Search
                placeholder="Cari pengguna atau role..."
                allowClear
                style={{ width: 400 }}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          style={{ scrollbarWidth: "thin" }}
          loading={loading}
          className="rounded-lg "
          scroll={{ x: "max-content" }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
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
        />
      </Card>
      <ManajemenUserModal
        codeBankData={codeBankData}
        codeBankLoading={codeBankLoading}
        createUserMutation={createUserMutation}
        editMode={editMode}
        formUser={formUser}
        handleUserSubmit={handleUserSubmit}
        isUserModalVisible={isUserModalVisible}
        roles={roles}
        selectedUser={selectedUser}
        setIsUserModalVisible={setIsUserModalVisible}
        setSelectedUser={setSelectedUser}
        updateUserMutation={updateUserMutation}
      />
    </>
  );
};

export default ManajemenRolePengguna;
