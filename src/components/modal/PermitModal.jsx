import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

const PermitModal = ({ isModalOpen, handleCancel, onFinish, form }) => {
  return (
    <Modal
      title={`Otorisasi`}
      open={isModalOpen}
      zIndex={1000}
      onCancel={handleCancel}
      okButtonProps={{ style: { display: "none" } }}
      cancelButtonProps={{ style: { display: "none" } }}
      width={450}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" className="mt-5">
        <Form.Item
          label="User Id"
          name="userId"
          rules={[
            {
              required: true,
              message: "Tolong input User Id!",
            },
          ]}
        >
          <Input placeholder="Input User Id" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Tolong input Password!",
            },
          ]}
        >
          <Input.Password placeholder="Input Password" />
        </Form.Item>
        <Form.Item>
          <button className="w-full bg-primary text-sm text-center text-white py-2.5 rounded-lg">
            Submit
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default PermitModal;
