import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Row,
  Col,
} from "antd";
import { BankOutlined } from "@ant-design/icons";

const ManajemenUserModal = ({
  editMode,
  isUserModalVisible,
  setIsUserModalVisible,
  selectedUser,
  setSelectedUser,
  formUser,
  handleUserSubmit,
  codeBankData,
  codeBankLoading,
  roles,
  createUserMutation,
  updateUserMutation,
}) => (
  <Modal
    title={editMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}
    open={isUserModalVisible}
    zIndex={900}
    width={600}
    onCancel={() => {
      setIsUserModalVisible(false);
      setSelectedUser(null);
      formUser.resetFields();
    }}
    footer={null}
  >
    <Form
      form={formUser}
      layout="vertical"
      onFinish={handleUserSubmit}
      className="mt-4"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="User ID"
            name="userId"
            rules={[
              { required: true, message: "User ID wajib diisi!" },
              { max: 10, message: "User ID maksimal 10 karakter!" },
              {
                validator: (_, value) => {
                  if (value && /\s/.test(value)) {
                    return Promise.reject(
                      "User ID tidak boleh mengandung spasi!"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="Masukkan User ID"
              disabled={editMode}
              className="!rounded-lg"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Nama Pengguna"
            name="userNm"
            rules={[{ required: true, message: "Nama pengguna wajib diisi!" }]}
          >
            <Input
              placeholder="Masukkan nama pengguna"
              className="!rounded-lg"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Limit"
            name="limit"
            rules={[{ required: true, message: "Limit wajib diisi!" }]}
          >
            <InputNumber
              placeholder="Masukkan limit"
              className="!rounded-lg !w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Kode Bank"
            name="kodeBank"
            rules={[{ required: true, message: "Kode Bank wajib diisi!" }]}
          >
            <Select
              placeholder={
                codeBankLoading ? "Memuat data bank..." : "Pilih Kode Bank"
              }
              // variant="filled"
              allowClear
              prefix={
                <BankOutlined
                  className="mr-2"
                  // style={{ color: textSecondary }}
                />
              }
              mode="multiple"
              loading={codeBankLoading}
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label?.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
              style={{
                borderRadius: "12px",
              }}
              options={codeBankData?.data?.map((bank) => ({
                value: bank.idCabang,
                label: (
                  <div className="flex justify-between">
                    <span className="font-medium">{bank.nmSingkat}</span>
                    <span className="text-gray-500">({bank.kodeCabang})</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="NIK"
            name="nik"
            rules={[{ required: true, message: "NIK wajib diisi!" }]}
          >
            <Input
              placeholder="Masukkan NIK pengguna"
              className="!rounded-lg"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={editMode ? "Password Lama" : "Password"}
        name="password"
        hasFeedback
        rules={[
          {
            required: !editMode,
            message: editMode
              ? "Password lama wajib diisi jika ingin mengubah password!"
              : "Password wajib diisi!",
          },
        ]}
      >
        <Input.Password
          placeholder={
            editMode ? "Masukkan password lama" : "Masukkan password"
          }
          className="!rounded-lg"
        />
      </Form.Item>

      <Form.Item
        label={editMode ? "Password Baru" : "Konfirmasi Password"}
        name={editMode ? "newPassword" : "confirmPassword"}
        hasFeedback
        rules={[
          {
            required: editMode ? false : !editMode,
            message: editMode
              ? "Password baru wajib diisi jika mengisi password lama!"
              : "Confirm password wajib diisi!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (editMode) {
                // Mode Edit: Validasi password baru
                if (getFieldValue("password") && !value) {
                  return Promise.reject(
                    new Error(
                      "Password baru wajib diisi jika mengisi password lama!"
                    )
                  );
                }
              } else {
                // Mode Create: Validasi confirm password
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Confirm password tidak sama dengan password!")
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input.Password
          placeholder={
            editMode ? "Masukkan password baru" : "Konfirmasi password"
          }
          className="!rounded-lg"
        />
      </Form.Item>

      <Form.Item label="Roles" name="roleIds">
        <Select
          mode="multiple"
          placeholder="Pilih roles untuk pengguna"
          className="!rounded-lg"
          optionFilterProp="label"
          options={roles?.data?.map((role) => ({
            value: role.roleId,
            label: role.roleName,
          }))}
        />
      </Form.Item>

      <Form.Item className="mb-0 text-right">
        <Space>
          <Button
            className="border !rounded-lg"
            onClick={() => {
              setIsUserModalVisible(false);
              setSelectedUser(null);
              formUser.resetFields();
            }}
          >
            Batal
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="border !rounded-lg"
            loading={
              createUserMutation.isLoading || updateUserMutation.isLoading
            }
          >
            {editMode ? "Update" : "Simpan"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);
export default ManajemenUserModal;
