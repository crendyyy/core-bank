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
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  FileSearchOutlined,
  BankOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [reportType, setReportType] = useState(null);
  const [date, setDate] = useState(null);
  const [codeBank, setCodeBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const axiosClient = useAxios();
  const { data: codeBankData, loading: codeBankLoading } = useGetCodeBank();

  const reportTypes = [
    {
      value: "NERACA",
      label: "NERACA",
      description: "Laporan Neraca Keuangan",
    },
    { value: "LABARUGI", label: "LABARUGI", description: "Laporan Laba Rugi" },
    {
      value: "OSTABUNGAN",
      label: "OSTABUNGAN",
      description: "Outstanding Tabungan",
    },
    {
      value: "OSDEPOSITO",
      label: "OSDEPOSITO",
      description: "Outstanding Deposito",
    },
    {
      value: "OSPINJAMAN",
      label: "OSPINJAMAN",
      description: "Outstanding Pinjaman",
    },
    { value: "TMW", label: "TMW", description: "Laporan Treasury Money Watch" },
  ];

  const generatePDF = async (values) => {
    if (!values.reportType || !values.date || !values.codeBank) {
      messageApi.error("Mohon lengkapi semua data terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      const formattedDate = values.date.format("DD-MM-YYYY");
      const isFinancialReport =
        values.reportType === "NERACA" || values.reportType === "LABARUGI";
      const urlEndpoint = isFinancialReport ? "GeneratePdf" : "GeneratePdf2";

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

      const response = await axiosClient._get(url, { responseType: "blob" });

      const contentDisposition = response.headers["content-disposition"];
      let filename = `Report_${values.reportType}_${formattedDate}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setPdfData({
        url: pdfUrl,
        blob: pdfBlob,
        filename: filename,
      });

      setPreviewVisible(true);
      messageApi.success("PDF berhasil digenerate!");
    } catch (error) {
      const errorStatus = error.response?.status;
      const errorMessage =
        errorStatus === 404
          ? "Data tidak ditemukan untuk kriteria yang dipilih"
          : "Gagal generate PDF. Silakan coba lagi.";

      messageApi.error(errorMessage);
      console.error("PDF generation error:", error);
    } finally {
      setLoading(false);
    }
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
    setDate(null);
    setCodeBank(null);
    setReportType(null);
  };

  useEffect(() => {
    return () => {
      if (pdfData?.url) {
        URL.revokeObjectURL(pdfData.url);
      }
    };
  }, [pdfData]);

  const findReportDescription = (value) => {
    const report = reportTypes.find((type) => type.value === value);
    return report?.description || "";
  };

  return (
    <>
      {contextHolder}
      <div className="">
        <div className="flex items-center mb-6">
          <FileSearchOutlined className="text-2xl mr-3 text-blue-600" />
          <Title level={2} className="m-0">
            Dashboard Laporan
          </Title>
        </div>

        <Card
          title={
            <span className="text-lg font-medium">Generate PDF Report</span>
          }
          className="shadow-lg rounded-lg"
          extra={
            <Text type="secondary">
              Generate dan unduh laporan dalam format PDF
            </Text>
          }
        >
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
            onFinish={generatePDF}
            initialValues={{
              reportType: reportType,
              date: date,
              codeBank: codeBank,
            }}
          >
            <Form.Item
              label={
                <span className="flex items-center">
                  <FileSearchOutlined className="mr-2" />
                  <span>Jenis Laporan</span>
                </span>
              }
              name="reportType"
              style={{ margin: '0px 0px 8px 0px' }}
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
                options={reportTypes.map((type) => ({
                  value: type.value,
                  label: (
                    <div>
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
                className="mb-4"
                showIcon
              />
            )}

            <Form.Item
              label={
                <span className="flex items-center">
                  <CalendarOutlined className="mr-2" />
                  <span>Tanggal</span>
                </span>
              }
              name="date"
              style={{ margin: '24px 0px 24px 0px' }}
              rules={[{ required: true, message: "Silakan pilih tanggal" }]}
            >
              <DatePicker
                className="w-full"
                onChange={(value) => setDate(value)}
                format="DD-MM-YYYY"
                placeholder="Pilih Tanggal"
                allowClear
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="flex items-center">
                  <BankOutlined className="mr-2" />
                  <span>Kode Bank</span>
                </span>
              }
              name="codeBank"
              rules={[{ required: true, message: "Silakan pilih kode bank" }]}
            >
              <Select
                placeholder={
                  codeBankLoading ? "Memuat data bank..." : "Pilih Kode Bank"
                }
                onChange={(value) => setCodeBank(value)}
                className="w-full"
                showSearch
                loading={codeBankLoading}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label?.toLowerCase() ?? "").includes(
                    input.toLowerCase()
                  )
                }
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

            <Divider />

            <div className="flex justify-end space-x-3">
              <Button onClick={handleReset}>Reset</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<EyeOutlined />}
                loading={loading}
              >
                Generate & Preview PDF
              </Button>
            </div>
          </Form>
        </Card>
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <FileSearchOutlined className="mr-2" />
            <span>Preview PDF</span>
          </div>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        className="pdf-preview-modal"
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Tutup
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadPDF}
          >
            Download PDF
          </Button>,
        ]}
      >
        <div className="h-[70vh] bg-gray-100 rounded-md">
          {pdfData ? (
            <iframe
              src={pdfData.url}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
              className="rounded"
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

export default Dashboard;
