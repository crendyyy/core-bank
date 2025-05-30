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
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useGetRoles } from "../service/roles/useGetRoles";
import { useAssignRolesUser } from "../service/userServices/useAssignRoleUser";
import { useDeleteRolesUser } from "../service/userServices/useDeleteRoleUser";
import usePermitValidation from "../hooks/usePermitValidation";
import PermitModal from "../components/modal/PermitModal";

const { Option } = Select;

const ManajemenRolePengguna = () => {
  const [formPermit] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: usersData } = useGetAllUser();
  const { data: roles } = useGetRoles();

  const assignRoleMutation = useAssignRolesUser();
  const deleteRoleMutation = useDeleteRolesUser();

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
        assignRoleMutation.mutate({
          userId: selectedUser.userId,
          roleId: selectedRole,
        });
        setIsModalVisible(false);
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
        deleteRoleMutation.mutate({
          userId: user.userId,
          roleId: roleId,
        });
        formPermit.resetFields();
      },
    });
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
    setSearchText(value);
    const filtered = users.filter(
      (user) =>
        user.userId.toLowerCase().includes(value.toLowerCase()) ||
        user.userNm.toLowerCase().includes(value.toLowerCase()) ||
        (user.roleName &&
          user.roleName.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredUsers(filtered);
  };

  const processUserData = () => {
    const userMap = new Map();

    filteredUsers.forEach((user) => {
      if (!userMap.has(user.userId)) {
        userMap.set(user.userId, {
          userId: user.userId,
          userNm: user.userNm,
          roles: [],
        });
      }

      if (user.roleId !== null) {
        userMap.get(user.userId).roles.push({
          roleId: user.roleId,
          roleName: user.roleName,
        });
      }
    });

    return Array.from(userMap.values());
  };

  const processedUsers = processUserData();

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
      title: "Roles",
      key: "roles",
      render: (_, record) => (
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
                      onOk: () => removeRole(record, role.roleId),
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
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="border !rounded-lg"
          onClick={() => {
            setSelectedUser(record);
            setIsModalVisible(true);
          }}
        >
          Tambah Role
        </Button>
      ),
    },
  ];

  const renderModal = () => (
    <Modal
      title={`Tambah Role untuk ${selectedUser?.userNm || ""}`}
      open={isModalVisible}
      zIndex={900}
      onCancel={() => {
        setIsModalVisible(false);
        setSelectedUser(null);
        setSelectedRole(null);
      }}
      footer={[
        <Button
          key="cancel"
          className="border !rounded-lg"
          onClick={() => {
            setIsModalVisible(false);
            setSelectedUser(null);
            setSelectedRole(null);
          }}
        >
          Batal
        </Button>,
        <Button
          key="submit"
          type="primary"
          className=" border !rounded-lg"
          loading={loading}
          onClick={assignRole}
          disabled={!selectedRole}
        >
          Tambah
        </Button>,
      ]}
    >
      <div className="mb-4">
        <label className="block mb-2 font-medium">Pilih Role:</label>
        <Select
          style={{ width: "100%" }}
          placeholder="Pilih role yang akan ditambahkan"
          onChange={(value) => setSelectedRole(value)}
          value={selectedRole}
          options={roles?.data?.map((role) => ({
            value: role.roleId,
            label: role.roleName,
            disabled: selectedUser?.roles.some((r) => r.roleId === role.roleId),
          }))}
        />
        {selectedUser?.roles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Role yang sudah dimiliki:</p>
            <div className="mt-2">
              {selectedUser.roles.map((role) => (
                <Tag color="blue" key={role.roleId} className="!rounded-lg">
                  {role.roleName}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

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
        <Title level={2} className="mb-4">
          Manajemen Role Pengguna
        </Title>
        <p className="text-gray-500 mb-6">
          Kelola hak akses pengguna dengan menambahkan atau menghapus role.
        </p>

        <div className="mb-6 flex justify-between items-center">
          <Input
            placeholder="Cari pengguna atau role..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Tooltip title="Info">
            <span className="text-gray-500">
              Total: {processedUsers.length} pengguna
            </span>
          </Tooltip>
        </div>

        <Table
          columns={columns}
          dataSource={processedUsers}
          rowKey="userId"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} pengguna`,
          }}
        />
      </Card>

      {isModalVisible && renderModal()}
    </>
  );
};

export default ManajemenRolePengguna;
