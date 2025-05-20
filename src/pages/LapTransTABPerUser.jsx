import { useState, useEffect } from "react";
import useAxios from "../hooks/useHooks";
import { useGetCodeBank } from "../service/codeBank/useGetCodeBank";
import {
  Button,
  Select,
  DatePicker,
  Form,
  Card,
  Typography,
  message,
  Modal,
  Spin,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Badge,
  Tooltip,
  Flex,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  FileSearchOutlined,
  BankOutlined,
  CalendarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs"; 
import { useLocation } from "react-router-dom";
import { useGetUserPermissions } from "../service/menus/useGetMenus";
import usePermitValidation from "../hooks/usePermitValidation";
import PermitModal from "../components/modal/PermitModal";

const { Title, Text } = Typography;

const primaryColor = "#2283F8";
const secondaryColor = "#0C4A8C";
const accentColor = "#4DABF5";
const textPrimary = "#333333";
const textSecondary = "#6B7AAA";

const gradientPrimary = `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`;

const LapTransTABPerUser = () => {
  const [form] = Form.useForm();
  const [formPermit] = Form.useForm();
  const [reportType, setReportType] = useState(null);
  const [date, setDate] = useState(null);
  const [codeBank, setCodeBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [recentReports, setRecentReports] = useState([]);

  const axiosClient = useAxios();
  const { data: codeBankData, loading: codeBankLoading } = useGetCodeBank();

  const {
    validatePermission,
    isPermitModalOpen,
    closePermitModal,
    handlePermitSubmit,
    contextHolder,
    messageApi
  } = usePermitValidation({ alwaysRequirePermit: false });

  const reportTypes = [
    {
      value: "NERACA",
      label: "NERACA",
      description: "Laporan Neraca Keuangan",
      icon: <FileSearchOutlined />,
      color: "#2563EB",
    },
    {
      value: "LABARUGI",
      label: "LABARUGI",
      description: "Laporan Laba Rugi",
      icon: <FileSearchOutlined />,
      color: "#10B981",
    },
    {
      value: "OSTABUNGAN",
      label: "OSTABUNGAN",
      description: "Outstanding Tabungan",
      icon: <FileSearchOutlined />,
      color: "#8B5CF6",
    },
    {
      value: "OSDEPOSITO",
      label: "OSDEPOSITO",
      description: "Outstanding Deposito",
      icon: <FileSearchOutlined />,
      color: "#EC4899",
    },
    {
      value: "OSPINJAMAN",
      label: "OSPINJAMAN",
      description: "Outstanding Pinjaman",
      icon: <FileSearchOutlined />,
      color: "#F59E0B",
    },
    {
      value: "TMW",
      label: "TMW",
      description: "Laporan Treasury Money Watch",
      icon: <FileSearchOutlined />,
      color: "#6366F1",
    },
  ];

  const closeModal = () => {
    closePermitModal();
    formPermit.resetFields();
  };

  const parseDateString = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return dayjs(`${year}-${month}-${day}`);
    }
    return null;
  };

  const generatePDF = (values) => {
    validatePermission({
      type: "print",
      actionName: "CanPrint",
      onSuccess: async () => {
        setLoading(true);
        try {
          const formattedDate = values.date.format("DD-MM-YYYY");
          const isFinancialReport =
            values.reportType === "NERACA" || values.reportType === "LABARUGI";
          const urlEndpoint = isFinancialReport
            ? "GeneratePdf"
            : "GeneratePdf2";

          const params = {
            reportType: values.reportType,
            date: formattedDate,
            KodeBank: values.codeBank,
            User: "sa",
          };

          if (!isFinancialReport) {
            params.Tipe = values.reportType;
          }

          const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&");

          const url = `/Report/${urlEndpoint}?${queryString}`;

          const response = await axiosClient._get(url, {
            responseType: "blob",
          });

          const contentDisposition = response.headers["content-disposition"];
          let filename = `Report_${values.reportType}_${formattedDate}.pdf`;

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch?.length > 1) {
              filename = filenameMatch[1];
            }
          }

          const pdfBlob = new Blob([response.data], {
            type: "application/pdf",
          });
          const pdfUrl = URL.createObjectURL(pdfBlob);

          setPdfData({
            url: pdfUrl,
            blob: pdfBlob,
            filename: filename,
          });

          const selectedBank = codeBankData?.data?.find(
            (bank) => bank.kodeBank === values.codeBank
          );
          const newReport = {
            id: Date.now(),
            reportType: values.reportType,
            date: formattedDate,
            codeBank: values.codeBank,
            bankName: selectedBank?.nmSingkat || "Unknown Bank",
            status: "success",
            timestamp: new Date().toISOString(),
          };

          setRecentReports((prev) => [newReport, ...prev].slice(0, 5));
          setPreviewVisible(true);
          messageApi.success("PDF berhasil digenerate!");
        } catch (error) {
          const errorStatus = error.response?.status;
          const errorMessage =
            errorStatus === 404
              ? "Data tidak ditemukan"
              : "Gagal generate PDF. Silakan coba lagi.";

          const selectedBank = codeBankData?.data?.find(
            (bank) => bank.kodeBank === values.codeBank
          );
          const newReport = {
            id: Date.now(),
            reportType: values.reportType,
            date: values.date.format("DD-MM-YYYY"),
            codeBank: values.codeBank,
            bankName: selectedBank?.nmSingkat || "Unknown Bank",
            status: "failed",
            timestamp: new Date().toISOString(),
          };

          setRecentReports((prev) => [newReport, ...prev].slice(0, 5));
          messageApi.error(errorMessage);
          console.error("PDF generation error:", error);
        } finally {
          setLoading(false);
        }
        formPermit.resetFields();
      },
    });
  };

  const handleReportClick = async (report) => {
    if (report.status !== "success") {
      messageApi.warning(
        "Tidak dapat membuka kembali laporan yang gagal dibuat"
      );
      return;
    }

    const dateValue = parseDateString(report.date);

    form.setFieldsValue({
      reportType: report.reportType,
      date: dateValue,
      codeBank: report.codeBank,
    });

    setReportType(report.reportType);
    setDate(dateValue);
    setCodeBank(report.codeBank);

    await generatePDF({
      reportType: report.reportType,
      date: dateValue,
      codeBank: report.codeBank,
    });
  };

  const downloadPDF = () => {
    if (!pdfData) return;

    const link = document.createElement("a");
    link.href = pdfData.url;
    link.setAttribute("download", pdfData.filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    messageApi.success("PDF berhasil diunduh!");
  };

  const handleReset = () => {
    form.resetFields();
    setReportType(null);
    setDate(null);
    setCodeBank(null);
    messageApi.info("Form telah direset");
  };

  useEffect(() => {
    return () => {
      if (pdfData?.url) {
        URL.revokeObjectURL(pdfData.url);
      }
    };
  }, [pdfData]);

  const findReportDescription = (value) => {
    if (!value) return "";
    const report = reportTypes.find((type) => type.value === value);
    return report?.description || "";
  };

  const findReportColor = (value) => {
    if (!value) return primaryColor;
    const report = reportTypes.find((type) => type.value === value);
    return report?.color || primaryColor;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {contextHolder}
      <PermitModal
        isModalOpen={isPermitModalOpen}
        handleCancel={closeModal}
        onFinish={handlePermitSubmit}
        form={formPermit}
      />
      <div className="bg-white p-6 rounded-lg">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <div className="flex items-center mb-4">
              <div
                className="flex items-center justify-center w-12 h-12 mr-4 rounded-xl"
                style={{ background: gradientPrimary }}
              >
                <FileSearchOutlined
                  style={{ fontSize: 24, color: "#FFFFFF" }}
                />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, color: secondaryColor }}>
                  SisGadai Pro
                </Title>
                <Text type="secondary">Laporan Keuangan</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={16}>
            <Card
              title={
                <span className="flex items-center">
                  <FileSearchOutlined
                    style={{ color: primaryColor, marginRight: "8px" }}
                  />
                  <span className="text-lg font-medium">
                    Generate Laporan PDF
                  </span>
                </span>
              }
              className="shadow-lg rounded-xl border-0"
              style={{ overflow: "hidden" }}
              styles={{
                header: {
                  background: "white",
                  borderBottom: 0,
                  paddingTop: "16px",
                  paddingBottom: "16px",
                },
                body: { padding: "20px" },
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={generatePDF}
                initialValues={{
                  reportType: reportType,
                  date: date,
                  codeBank: codeBank,
                }}
              >
                <Form.Item
                  label={
                    <span className="flex items-center font-medium text-textPrimary">
                      <FileSearchOutlined
                        style={{ marginRight: "8px", color: primaryColor }}
                      />
                      <span>Jenis Laporan</span>
                    </span>
                  }
                  name="reportType"
                  style={{ marginBottom: "12px" }}
                  rules={[
                    { required: true, message: "Silakan pilih jenis laporan" },
                  ]}
                >
                  <Select
                    placeholder="Pilih Jenis Laporan"
                    onChange={(value) => setReportType(value)}
                    className="w-full"
                    showSearch
                    allowClear
                    optionFilterProp="value"
                    style={{ borderRadius: "10px" }}
                    dropdownStyle={{ borderRadius: "10px" }}
                    options={reportTypes.map((type) => ({
                      value: type.value,
                      label: (
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 mr-2 rounded-full"
                            style={{ backgroundColor: type.color }}
                          ></div>
                          <span className="font-medium">{type.label}</span>
                        </div>
                      ),
                    }))}
                  />
                </Form.Item>

                {reportType && (
                  <Alert
                    message={findReportDescription(reportType)}
                    type="info"
                    className="mb-4 rounded-xl"
                    showIcon
                    icon={
                      <InfoCircleOutlined
                        style={{ color: findReportColor(reportType) }}
                      />
                    }
                    style={{
                      borderLeft: `4px solid ${findReportColor(reportType)}`,
                      backgroundColor: `${findReportColor(reportType)}10`,
                    }}
                  />
                )}

                <Flex justify="space-between" gap={16}>
                  <Form.Item
                    label={
                      <span
                        className="flex items-center font-medium"
                        style={{ color: textPrimary }}
                      >
                        <CalendarOutlined
                          style={{ marginRight: "8px", color: primaryColor }}
                        />
                        <span>Tanggal</span>
                      </span>
                    }
                    name="date"
                    style={{ margin: "12px 0px 0px 0px", width: "100%" }}
                    rules={[
                      { required: true, message: "Silakan pilih tanggal" },
                    ]}
                  >
                    <DatePicker
                      className="w-full"
                      onChange={(value) => setDate(value)}
                      format="DD-MM-YYYY"
                      placeholder="Pilih Tanggal"
                      allowClear
                      style={{
                        borderRadius: "8px",
                        padding: "8px 12px",
                        height: "auto",
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span
                        className="flex items-center font-medium"
                        style={{ color: textPrimary }}
                      >
                        <BankOutlined
                          style={{ marginRight: "8px", color: primaryColor }}
                        />
                        <span>Kode Bank</span>
                      </span>
                    }
                    name="codeBank"
                    style={{ margin: "12px 0px 0px 0px", width: "100%" }}
                    rules={[
                      { required: true, message: "Silakan pilih kode bank" },
                    ]}
                  >
                    <Select
                      placeholder={
                        codeBankLoading
                          ? "Memuat data bank..."
                          : "Pilih Kode Bank"
                      }
                      onChange={(value) => setCodeBank(value)}
                      className="w-full"
                      showSearch
                      loading={codeBankLoading}
                      optionFilterProp="children"
                      style={{ borderRadius: "10px", height: "40px" }}
                      filterOption={(input, option) =>
                        (option?.label?.toLowerCase() ?? "").includes(
                          input.toLowerCase()
                        )
                      }
                      options={codeBankData?.data?.map((bank) => ({
                        value: bank.kodeBank,
                        label: (
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {bank.nmSingkat}
                            </span>
                            <span className="text-gray-500">
                              ({bank.kodeBank})
                            </span>
                          </div>
                        ),
                      }))}
                    />
                  </Form.Item>
                </Flex>

                <Divider style={{ margin: "8px 0 24px 0" }} />

                <div className="flex flex-wrap gap-3 justify-end">
                  <Button
                    onClick={handleReset}
                    icon={<ReloadOutlined />}
                    style={{
                      borderRadius: "8px",
                      borderColor: secondaryColor,
                      color: secondaryColor,
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<EyeOutlined />}
                    loading={loading}
                    style={{
                      background: gradientPrimary,
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: `0 4px 14px 0 ${primaryColor}66`,
                    }}
                  >
                    {loading ? "Memproses..." : "Generate & Preview PDF"}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <span className="flex items-center">
                  <CheckCircleOutlined
                    style={{ color: accentColor, marginRight: "8px" }}
                  />
                  <span className="text-lg font-medium">Riwayat Laporan</span>
                </span>
              }
              className="shadow-lg rounded-xl border-0 scroll-smooth"
              style={{
                overflow: "auto",
                maxHeight: "362px",
                scrollbarWidth: "thin",
              }}
              styles={{
                header: {
                  background: "white",
                  borderBottom: 0,
                  paddingTop: "16px",
                  paddingBottom: "16px",
                },
                body: { padding: "8px 20px" },
              }}
            >
              {recentReports.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3 rounded-xl transition-all hover:bg-gray-50"
                      style={{
                        borderLeft: `3px solid ${
                          report.status === "success" ? accentColor : "#f87171"
                        }`,
                        cursor:
                          report.status === "success" ? "pointer" : "default",
                      }}
                      onClick={() =>
                        report.status === "success" && handleReportClick(report)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <Badge
                              status={
                                report.status === "success"
                                  ? "success"
                                  : "error"
                              }
                              text={
                                <span className="font-medium">
                                  {report.reportType}
                                </span>
                              }
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {report.bankName} ({report.codeBank}) •{" "}
                            {report.date}
                          </div>
                        </div>
                        <Tooltip
                          title={
                            report.status === "success"
                              ? "Klik untuk generate ulang laporan ini"
                              : "Gagal dibuat"
                          }
                        >
                          {report.status === "success" ? (
                            <RedoOutlined
                              style={{ color: "#10B981", fontSize: "16px" }}
                            />
                          ) : (
                            <ExclamationCircleOutlined
                              style={{ color: "#f87171", fontSize: "16px" }}
                            />
                          )}
                        </Tooltip>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(report.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Text type="secondary">Belum ada riwayat laporan</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <div
              className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg"
              style={{ background: gradientPrimary }}
            >
              <FileSearchOutlined style={{ color: "white" }} />
            </div>
            <span>Preview PDF</span>
          </div>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        className="pdf-preview-modal"
        style={{ top: 20 }}
        styles={{
          body: { padding: "16px" },
        }}
        footer={[
          <Button
            key="close"
            onClick={() => setPreviewVisible(false)}
            style={{ borderRadius: "8px" }}
          >
            Tutup
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadPDF}
            style={{
              background: gradientPrimary,
              borderRadius: "8px",
              border: "none",
            }}
          >
            Download PDF
          </Button>,
        ]}
      >
        <div className="h-[75vh] bg-gray-100 rounded-xl">
          {pdfData ? (
            <iframe
              src={pdfData.url}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
              className="rounded-xl"
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <Space direction="vertical" align="center">
                <Spin size="large" />
                <Text type="secondary">Memuat PDF...</Text>
              </Space>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default LapTransTABPerUser;
