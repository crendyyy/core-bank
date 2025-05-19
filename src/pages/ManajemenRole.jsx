import Title from "antd/es/typography/Title";
import { useGetRoles, useGetRolesAction } from "../service/roles/useGetRoles";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Popconfirm,
  Table,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDeleteRoles } from "../service/roles/useDeleteRoles";
import { useUpdateRoles } from "../service/roles/useUpdateRoles";
import RolesModal from "../components/modal/RolesModal";
import { useCreateRoles } from "../service/roles/useCreateRole";
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import PermitModal from "../components/modal/PermitModal";
import { useGetUserPermissions } from "../service/menus/useGetMenus";

const ManajemenRole = () => {
  const [form] = Form.useForm();
  const [formPermit] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState({
    addRoleModal: false,
    permitModal: false,
  });
  const [editingKey, setEditingKey] = useState("");
  const [editInput, setEditInput] = useState("");

  const { data: roles } = useGetRoles();

  const deleteRolesMutation = useDeleteRoles();
  const updateRolesRolesMutation = useUpdateRoles();
  const createRolesRolesMutation = useCreateRoles();

  
  const location = useLocation();
  console.log(location.pathname);
  
  const { data: userPermission } = useGetUserPermissions(location.pathname);
  
  console.log(userPermission?.data);

  const isEditing = (record) => record.key === editingKey;

  const showModal = (modal) => {
    setIsModalOpen((prev) => ({
      ...prev,
      [modal]: true,
    }));
  };

  const closeModal = (modal) => {
    setIsModalOpen((prev) => ({
      ...prev,
      [modal]: false,
    }));
  };

  const handleDelete = (key) => {
    deleteRolesMutation.mutate(key);
  };

  const handleAdd = (value) => {
    createRolesRolesMutation.mutate({ roleName: value.roleName });
     closeModal("addRoleModal");
  };

  const edit = (record) => {
    setEditingKey(record.key);
    setEditInput(record.roleName);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = (record) => {
    updateRolesRolesMutation.mutate({
      id: record.key,
      data: { roleName: editInput },
    });
    setEditingKey("");
  };

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      align: "center",
      width: 10,
      render: (text, record, index) => {
        return <>{index + 1}</>;
      },
    },
    {
      title: "Name Role",
      dataIndex: "roleName",
      width: "50%",
      render: (text, record) => {
        const editable = isEditing(record);

        return editable ? (
          <Input
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            style={{ width: "100%" }}
          />
        ) : (
          <Typography.Text
            onClick={editingKey === "" ? () => edit(record) : undefined}
            className={`${
              editingKey === ""
                ? `${
                    !/^[A-Z]/.test(record.key.toString())
                      ? "hover:border  border-primary py-1 px-3 rounded pointer"
                      : ""
                  }`
                : "opacity-50 not-allowed"
            }`}
          >
            {text}
          </Typography.Text>
        );
      },
    },
    {
      title: "Aksi",
      dataIndex: "operation",
      width: "50%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="small"
              onClick={() => save(record)}
              style={{ backgroundColor: "#1890ff" }}
            >
              Save
            </Button>
            <Button icon={<CloseOutlined />} size="small" onClick={cancel}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => edit(record)}
              className=" text-primary bg-white px-2 py-1 rounded-md w-full text-center text-xs hover:bg-primary hover:text-white"
              disabled={editingKey !== ""}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this role?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                danger
                size="small"
                disabled={editingKey !== ""}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const data = roles?.data?.map((data) => ({
    key: data.roleId,
    ...data,
  }));

  return (
    <>
      <RolesModal
        isModalOpen={isModalOpen.addRoleModal}
        handleCancel={() => closeModal("addRoleModal")}
        onFinish={handleAdd}
        form={form}
      />
       <PermitModal
        isModalOpen={isModalOpen.permitModal}
        handleCancel={() => closeModal("permitModal")}
        onFinish={''}
        form={formPermit}
      />
      <Flex vertical gap={24}>
        <Card
          className="!shadow-sm !border !border-gray-100 !overflow-hidden"
          style={{ borderRadius: "8px" }}
          styles={{ body: { padding: "24px" } }}
        >
          <Flex vertical gap={16}>
            <Flex justify="space-between" align="center">
              <div>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "24px",
                  }}
                >
                  Manajemen Role
                </Title>
              </div>
            </Flex>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <Flex justify="space-between" align="center">
                <Button
                  onClick={() => showModal("addRoleModal")}
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  size="large"
                  style={{
                    backgroundColor: "#2283F8",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 2px 0 rgba(34, 131, 248, 0.1)",
                  }}
                >
                  Tambah Role
                </Button>
                <span className="text-sm text-gray-500">
                  Total:{" "}
                  <span className="font-medium">{data?.length} roles</span>
                </span>
              </Flex>
            </div>

            <Table
              rowClassName={() => "editable-row"}
              dataSource={data}
              bordered
              columns={columns}
              pagination={{
                pageSize: 10,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                style: { marginTop: "16px" },
              }}
            />
          </Flex>
        </Card>
      </Flex>
    </>
  );
};

export default ManajemenRole;