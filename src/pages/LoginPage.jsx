import { Form, Input, Layout, Select, Typography, message } from "antd";
import {
  LockOutlined,
  UserOutlined,
  BankOutlined,
  PropertySafetyOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useGetCodeBank } from "../service/codeBank/useGetCodeBank";
import { useLogin } from "../service/userServices/userService";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

const primaryColor = "#FF6B35";
const secondaryColor = "#004E89";
const bgLight = "#F9F7F7";
const textPrimary = "#333333";
const textSecondary = "#6C6F93";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loginValues, setLoginValues] = useState({
    UserID: "",
    Password: "",
    kodeBank: null,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const { data: codeBankData, loading: codeBankLoading } = useGetCodeBank();

  const handleFormValuesChange = (changedValues, allValues) => {
    setLoginValues({ ...loginValues, ...changedValues });
  };

  const onFinish = () => {
    if (loginMutation.isPending) return;

    const key = "login";
    message.loading({ content: "Login...", key });

    loginMutation.mutate(loginValues, {
      onSuccess: (data) => {
        if (data && data.data) {
          const { token, user } = data.data;
          if (token) {
            localStorage.setItem("token", token);
            navigate("/dashboard");
            message.success({ content: "Login successful.", key });
            setFormSubmitted(true);
          } else {
            message.error({ content: "Invalid credentials", key });
          }
        } else {
          message.error({
            content: "Unexpected response format. Please try again.",
            key,
          });
        }
      },
      onError: (data) => {
        message.error({
          content: `${data.response?.data?.msg || data.message}`,
          key,
        });
      },
    });
  };

  const handleReset = () => {
    form.resetFields();
    setLoginValues({
      UserID: "",
      Password: "",
      kodeBank: null,
    });
    setFormSubmitted(false);
    localStorage.removeItem("sisGadaiUser");
    message.info("Form telah direset");
  };

  return (
    <Layout
      className="flex items-center justify-center"
      style={{ minHeight: "100vh", background: bgLight }}
    >
      <Content className="flex items-center justify-center w-full max-w-md px-6">
        <div
          className="flex flex-col w-full gap-6 p-8 rounded-2xl shadow-lg"
          style={{ background: "#FFFFFF" }}
        >
          <div className="flex flex-col items-center mb-2 text-center">
            <div
              className="flex items-center justify-center mb-4 rounded-full w-20 h-20"
              style={{ background: primaryColor }}
            >
              <PropertySafetyOutlined
                style={{ fontSize: 32, color: "#FFFFFF" }}
              />
            </div>
            <Title
              level={2}
              style={{
                color: secondaryColor,
                marginBottom: "4px",
                fontWeight: "700",
              }}
            >
              SisGadai Pro
            </Title>
            <Text style={{ color: textSecondary, fontSize: "16px" }}>
              Masukkan detail akun Anda untuk login
            </Text>
          </div>

          {/* Form Section */}
          <Form
            layout="vertical"
            name="login"
            form={form}
            initialValues={{
              UserID: "",
              Password: "",
              kodeBank: null,
            }}
            onFinish={onFinish}
            onValuesChange={handleFormValuesChange}
            size="large"
            className="w-full"
          >
            <Form.Item
              label={<span style={{ color: textPrimary }}>Username</span>}
              name="UserID"
              rules={[{ required: true, message: "Username wajib diisi!" }]}
            >
              <Input
                prefix={
                  <UserOutlined
                    className="mr-2"
                    style={{ color: textSecondary }}
                  />
                }
                placeholder="Masukkan username"
                style={{
                  borderRadius: "12px",
                  backgroundColor: bgLight,
                  border: "none",
                  padding: "12px 16px",
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: textPrimary }}>Password</span>}
              name="Password"
              rules={[{ required: true, message: "Password wajib diisi!" }]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    className="mr-2"
                    style={{ color: textSecondary }}
                  />
                }
                placeholder="Masukkan password"
                style={{
                  borderRadius: "12px",
                  backgroundColor: bgLight,
                  border: "none",
                  padding: "12px 16px",
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <div className="flex gap-2">
                  <span style={{ color: textPrimary }}>Kode Bank</span>
                  <span className="text-gray-400">(Optional)</span>
                </div>
            }
              name="kodeBank"
            >
              <Select
                placeholder={
                  codeBankLoading ? "Memuat data bank..." : "Pilih Kode Bank"
                }
                className="w-full"
                showSearch
                loading={codeBankLoading}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label?.toLowerCase() ?? "").includes(
                    input.toLowerCase()
                  )
                }
                style={{
                  borderRadius: "12px",
                }}
                options={codeBankData?.data?.map((bank) => ({
                  value: bank.kodeBank,
                  label: (
                    <div className="flex justify-between">
                      <span className="font-medium">{bank.nmSingkat}</span>
                      <span className="text-gray-500">({bank.kodeBank})</span>
                    </div>
                  ),
                }))}
              />
            </Form.Item>

            <div className="flex justify-end mb-4">
              <Text
                className="cursor-pointer hover:underline"
                style={{ color: primaryColor }}
              >
                Ubah Password
              </Text>
            </div>

            <Form.Item>
              <button
                className="w-full py-3 text-base font-medium text-center text-white transition-all rounded-xl hover:opacity-90"
                type="submit"
                disabled={loginMutation.isPending}
                style={{
                  background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`,
                  boxShadow: `0 4px 14px 0 ${primaryColor}66`,
                  opacity: loginMutation.isPending ? 0.7 : 1,
                  cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                {loginMutation.isPending ? "Memproses..." : "Masuk"}
              </button>
            </Form.Item>

            {formSubmitted && (
              <div
                className="mt-4 p-4 rounded-lg"
                style={{ background: bgLight }}
              >
                <Text strong style={{ color: secondaryColor }}>
                  Data Tersimpan:
                </Text>
                <pre
                  className="mt-2 p-2 rounded"
                  style={{ background: "#fff", fontSize: "12px" }}
                >
                  {JSON.stringify(loginValues, null, 2)}
                </pre>
              </div>
            )}
          </Form>

          <div className="flex justify-between items-center mt-2">
            <Text style={{ color: textSecondary }}>
              Belum punya akun?{" "}
              <span
                className="cursor-pointer"
                style={{ color: primaryColor, fontWeight: 600 }}
              >
                Hubungi Admin
              </span>
            </Text>

            <button
              onClick={handleReset}
              type="button"
              className="text-sm px-3 py-1 rounded-md transition-all"
              style={{
                color: secondaryColor,
                border: `1px solid ${secondaryColor}`,
              }}
            >
              Reset Form
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default LoginPage;
