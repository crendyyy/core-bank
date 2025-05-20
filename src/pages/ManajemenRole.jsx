import Title from "antd/es/typography/Title";
import { useGetRoles } from "../service/roles/useGetRoles";
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
import React, { useState } from "react";
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
import PermitModal from "../components/modal/PermitModal";
import usePermitValidation from "../hooks/usePermitValidation";

const ManajemenRole = () => {
  const [form] = Form.useForm();
  const [formPermit] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [editInput, setEditInput] = useState("");

  // Use our custom hook with alwaysRequirePermit set to true
  const {
    validatePermission,
    isPermitModalOpen,
    closePermitModal,
    handlePermitSubmit,
    isActionModalOpen,
    openActionModal,
    closeActionModal,
    contextHolder,
  } = usePermitValidation({ alwaysRequirePermit: true });

  const { data: roles } = useGetRoles();
  const deleteRolesMutation = useDeleteRoles();
  const updateRolesMutation = useUpdateRoles();
  const createRolesMutation = useCreateRoles();

  const isEditing = (record) => record.key === editingKey;

  const closeModal = () => {
    closePermitModal();
    closeActionModal();
    form.resetFields();
    formPermit.resetFields();
  };

  const handleAdd = (value) => {
    validatePermission({
      type: "add",
      actionName: "CanCreate",
      onSuccess: () => {
        createRolesMutation.mutate({ roleName: value.roleName });
        closeActionModal();
        form.resetFields();
        formPermit.resetFields();
      }, // Open add role modal
    });
  };

  const handleDelete = (key) => {
    validatePermission({
      type: "delete",
      actionName: "CanDelete",
      data: key,
      onSuccess: (key) => {
        deleteRolesMutation.mutate(key);
        formPermit.resetFields();
      },
    });
  };

  const edit = (record) => {
    setEditingKey(record.key);
    setEditInput(record.roleName);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = (record) => {
    validatePermission({
      type: "save",
      actionName: "CanUpdate",
      data: { record, editInput },
      onSuccess: (data) => {
        updateRolesMutation.mutate({
          id: data.record.key,
          data: { roleName: data.editInput },
        });
        setEditingKey("");
        formPermit.resetFields();
      },
    });
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
                      ? "hover:border border-primary py-1 px-3 rounded pointer"
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
              style={{ borderRadius: "8px" }}
              onClick={() => edit(record)}
              className="text-primary bg-white px-2 py-1 rounded-lg border w-full text-center text-xs hover:bg-primary hover:text-white"
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
                style={{ borderRadius: "8px" }}
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
      {contextHolder}
      <RolesModal
        isModalOpen={isActionModalOpen}
        handleCancel={closeModal}
        onFinish={handleAdd}
        form={form}
      />
      <PermitModal
        isModalOpen={isPermitModalOpen}
        handleCancel={closeModal}
        onFinish={handlePermitSubmit}
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
                  onClick={openActionModal}
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
