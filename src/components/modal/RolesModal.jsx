import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

const RolesModal = ({ isModalOpen, handleCancel, onFinish, form }) => {
  return (
    <Modal
      title={`Tambah Role`}
      open={isModalOpen}
      onCancel={handleCancel}
      okButtonProps={{ style: { display: "none" } }}
      cancelButtonProps={{ style: { display: "none" } }}
      width={450}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" className="mt-5">
        <Form.Item
          label="Nama Role"
          name="roleName"
          rules={[
            {
              required: true,
              message: "Tolong input Role Name!",
            },
          ]}
        >
          <Input placeholder="Input Role Name" />
        </Form.Item>
        <Form.Item>
          <button className="w-full bg-primary text-sm text-center text-white py-2.5 rounded">Submit</button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default RolesModal;