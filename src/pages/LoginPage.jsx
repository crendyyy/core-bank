import { Form, Input, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { useState } from "react";

const LoginPage = () => {
  const [count, setCount] = useState(0);

  return (
    <Layout className="flex items-center justify-center bg-white">
      <Content className="flex items-center w-80">
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col items-center mb-8 text-center">
            <img alt="Logo Koi" className="mb-6 w-fit" />
            <h1 className="mb-1 text-3xl font-bold">Welcome!</h1>
            <p className="text-[#6C6F93]">Please enter Your Account details.</p>
          </div>
          <Form
            layout="vertical"
            style={{ maxWidth: 600 }}
            name="login"
            initialValues={{ remember: true }}
            onFinish=""
          >
            <Form.Item
              label="Username"
              rules={[
                { required: true, message: "Please input your Username!" },
              ]}
              className="text-[#0E0B3D] text-sm"
            >
              <Input
                placeholder="Enter username"
                required
                className="bg-[#F7F9FC] placeholder:text-[#B3B8D0] text-sm px-4 py-3 border-0 rounded-xl hover:bg-[#F7F9FC] focus:bg-[#F7F9FC] focus:ring-1 "
              />
            </Form.Item>
            <Form.Item
              label="Password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input
                placeholder="Enter password"
                type="password"
                required
                className="bg-[#F7F9FC] placeholder:text-[#B3B8D0] text-sm px-4 py-3 border-0 rounded-xl hover:bg-[#F7F9FC] focus:bg-[#F7F9FC] focus:ring-1 "
              />
            </Form.Item>
            <Form.Item>
              <button
                className="w-full py-3 text-base text-center text-white bg-primary rounded-xl"
                type="submit"
              >
                Sign In
              </button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default LoginPage;
