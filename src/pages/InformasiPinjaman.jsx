import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  Table,
  Radio,
  Select,
  Card,
  Row,
  Col,
  Space,
  Breadcrumb,
  Tabs,
  Spin,
} from "antd";
import { SearchOutlined, HomeOutlined, LeftOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { useGetCIF } from "../service/CIF/useGetCIF";
import { useGetDetailPinjaman } from "../service/Pinjaman/useGetKreditDetail";
import { useGetKreditRekening } from "../service/Pinjaman/useGetKreditRekening";
import { useGetKreditSetup } from "../service/Pinjaman/useGetKreditSetup";
import { useGetKodePinjaman } from "../service/Pinjaman/useGetKodePinjaman";

const { Option } = Select;
const { TabPane } = Tabs;

const InformasiPinjaman = () => {
  // State management
  const [currentStep, setCurrentStep] = useState("search"); // search, cifList, kreditList, kreditDetail
  const [searchParams, setSearchParams] = useState({
    nama: "",
    noKartuID: "",
    tempatLahir: "",
    namaIbuKandung: "",
  });
  const [selectedCIF, setSelectedCIF] = useState(null);
  const [selectedKreditRekening, setSelectedKreditRekening] = useState(null);
  const [kreditStatus, setKreditStatus] = useState("A"); // L atau A
  const [transParameter, setTransParameter] = useState("T");
  const [jaminanParameter, setJaminanParameter] = useState("J");

  // API Calls
  const { data: dataCIF, refetch: refetchCIF } = useGetCIF(
    currentStep === "cifList" ? searchParams : {}
  );

  const { data: dataKreditRekening, refetch: refetchKreditRekening } =
    useGetKreditRekening(
      selectedCIF ? { noCIF: selectedCIF.noCIF, status: kreditStatus } : {}
    );

  const { data: detailPinjaman, refetch: refetchDetail } = useGetDetailPinjaman(
    selectedKreditRekening?.noRekKredit || null,
    kreditStatus,
    { Trans: transParameter, Jaminan: jaminanParameter }
  );

  const { data: dataKreditSetup } = useGetKreditSetup(
    selectedKreditRekening
      ? { kdProduk: selectedKreditRekening.kodeProduk }
      : {}
  );

  const { data: dataKodePinjaman } = useGetKodePinjaman();

  useEffect(() => {
    if (currentStep === "kreditDetail") {
      refetchDetail();
    }
  }, [transParameter, currentStep, jaminanParameter]);

  // Helper function to get keterangan from dataKodePinjaman
  const getKeterangan = (grup, id) => {
    if (!dataKodePinjaman?.data?.[grup]) return id || "-";
    const item = dataKodePinjaman.data[grup].find((item) => item.id === id);
    return item ? item.keterangan : id || "-";
  };

  // Helper function for Kantor (kodeBank)
  const getKantorDisplay = (kodeBank) => {
    if (!kodeBank) return "-";
    // Get last 2 digits
    const lastTwoDigits = kodeBank.toString().slice(-2);
    const kantor = dataKodePinjaman?.data?.Kantor?.find(
      (item) => item.id === lastTwoDigits
    );
    return kantor ? `${kantor.id} - ${kantor.keterangan}` : kodeBank;
  };

  // Handle search CIF
  const handleSearchCIF = () => {
    if (Object.values(searchParams).some((val) => val.trim() !== "")) {
      setCurrentStep("cifList");
      refetchCIF();
    }
  };

  // Handle select CIF
  const handleSelectCIF = (cifData) => {
    setSelectedCIF(cifData);
    setCurrentStep("kreditList");
  };

  // Handle select Kredit Rekening
  const handleSelectKreditRekening = (kreditData) => {
    setSelectedKreditRekening(kreditData);
    setCurrentStep("kreditDetail");
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setKreditStatus(value);
    if (selectedCIF) {
      refetchKreditRekening();
    }
  };

  //Handler untuk Trans parameter change
  const handleTransParameterChange = (value) => {
    setTransParameter(value);
  };

  const handleJaminanParameterChange = (value) => {
    setJaminanParameter(value);
  };

  // CIF Table Columns
  const cifColumns = [
    { title: "No CIF", dataIndex: "noCIF", key: "noCIF" },
    { title: "Nama", dataIndex: "nama", key: "nama" },
    { title: "No Kartu ID", dataIndex: "noKartuID", key: "noKartuID" },
    { title: "Jenis Kelamin", dataIndex: "jenisKelamin", key: "jenisKelamin" },
    { title: "Tempat Lahir", dataIndex: "tempatLahir", key: "tempatLahir" },
    { title: "Tanggal Lahir", dataIndex: "tglLahir", key: "tglLahir" },
    {
      title: "Alamat",
      key: "alamat",
      render: (_, record) =>
        `${record.alamatRumah1 || ""} ${record.alamatRumah2 || ""} ${
          record.alamatRumah3 || ""
        }`.trim(),
    },
    { title: "Telp Genggam", dataIndex: "telpGenggam", key: "telpGenggam" },
    {
      title: "Nama Ibu Kandung",
      dataIndex: "namaIbuKandung",
      key: "namaIbuKandung",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleSelectCIF(record)}>
          Pilih
        </Button>
      ),
    },
  ];

  // Kredit Rekening Table Columns
  const kreditColumns = [
    {
      title: "Kode Bank",
      dataIndex: "kodeBank",
      key: "kodeBank",
      render: (val) => getKantorDisplay(val),
    },
    { title: "No Rek Kredit", dataIndex: "noRekKredit", key: "noRekKredit" },
    { title: "Nama Rekening", dataIndex: "nmRek", key: "nmRek" },
    {
      title: "Jenis Fasilitas",
      dataIndex: "sJFK",
      key: "sJFK",
      render: (val) => getKeterangan("FasilitasKredit", val),
    },
    {
      title: "Plafon Awal",
      dataIndex: "amtPlafon",
      key: "amtPlafon",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Out Standing",
      dataIndex: "amtSisaPokok",
      key: "amtSisaPokok",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Baki Debet",
      key: "totalSisaTunggak",
      render: (_, record) =>
        (record.amtSisaPokok + record.totTunggakPokok)?.toLocaleString(),
    },
    {
      title: "Sisa Plafon",
      dataIndex: "sisaPlafonCair",
      key: "sisaPlafonCair",
      render: (val) => val?.toLocaleString(),
    },
    { title: "Bunga Flat (%)", dataIndex: "bngF", key: "bngF" },
    { title: "Denda (%)", dataIndex: "pLateFee", key: "pLateFee" },
    { title: "Tanggal Mulai", dataIndex: "tgMulai", key: "tgMulai" },
    { title: "Tanggal Awal", dataIndex: "tgAwal", key: "tgAwal" },
    { title: "Tanggal Akhir", dataIndex: "tgAkhir", key: "tgAkhir" },
    { title: "Adendum Ke", dataIndex: "adendumKe", key: "adendumKe" },
    { title: "JWB", dataIndex: "jwb", key: "jwb" },
    {
      title: "Angsuran Bulanan",
      dataIndex: "amtCPB",
      key: "amtCPB",
      render: (val) => val?.toLocaleString(),
    },
    { title: "Angsuran Ke", dataIndex: "blnKe", key: "blnKe" },
    {
      title: "Marketing",
      dataIndex: "kdKaryawan",
      key: "kdKaryawan",
      render: (val) => getKeterangan("Karyawan", val),
    },
    {
      title: "Penaksir",
      dataIndex: "idSurveyor",
      key: "idSurveyor",
      render: (val) => getKeterangan("Karyawan", val),
    },
    { title: "Pengusaha", dataIndex: "isPengusaha", key: "isPengusaha" },
    {
      title: "Penghasilan/Tahun",
      dataIndex: "penghasilanPerTahun",
      key: "penghasilanPerTahun",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Nilai Tanah Bangunan",
      dataIndex: "nilaiTnhBgnUsaha",
      key: "nilaiTnhBgnUsaha",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Jenis Usaha",
      dataIndex: "kodeJenisUsaha",
      key: "kodeJenisUsaha",
      render: (val) => getKeterangan("JenisUsaha", val),
    },
    {
      title: "Kekayaan Bersih",
      dataIndex: "kekayaanBersih",
      key: "kekayaanBersih",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Sumber Dana Pelunasan",
      dataIndex: "kdSumberDana",
      key: "kdSumberDana",
      render: (val) => getKeterangan("SumberDana", val),
    },
    {
      title: "Sumber Dana Lain",
      dataIndex: "sumberDanaLain",
      key: "sumberDanaLain",
    },
    {
      title: "Kolektibilitas",
      dataIndex: "sKolektibilitas",
      key: "sKolektibilitas",
    },
    {
      title: "Tanggal Macet",
      key: "tglMacet",
      render: (_, record) =>
        record.sKolektibilitas === "5" ? record.tglMacet || "-" : "-",
    },
    { title: "Status", dataIndex: "stsRek", key: "stsRek" },
    { title: "File Pinjaman", dataIndex: "fileKredit", key: "fileKredit" },
    { title: "PIC", dataIndex: "noPIC", key: "noPIC" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleSelectKreditRekening(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  //Columns untuk tabel Transaksi (Trans=T)
  const transaksiColumns = [
    { title: "No", key: "No", render: (_, __, index) => index + 1 },
    {
      title: "Tanggal",
      dataIndex: "tanggalTr",
      key: "tanggalTr",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
    {
      title: "Nominal Cair",
      dataIndex: "nominalCair",
      key: "nominalCair",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Nominal Lunas",
      dataIndex: "nominalByr",
      key: "nominalByr",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Out Standing",
      dataIndex: "outstanding",
      key: "outstanding",
      render: (val) => val?.toLocaleString(),
    },
    { title: "Keterangan", dataIndex: "keterangan", key: "keterangan" },
    { title: "User", dataIndex: "usertr", key: "usertr" },
    { title: "Approve", dataIndex: "userApprove", key: "userApprove" },
  ];

  //Columns untuk tabel Tagihan (Trans=AB)
  const tagihanColumns = [
    { title: "Cicilan Ke", dataIndex: "cclKe", key: "cclKe" },
    {
      title: "Tanggal Cicilan",
      dataIndex: "tgCcl",
      key: "tgCcl",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
    {
      title: "Out Standing",
      dataIndex: "sisaPok",
      key: "sisaPok",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Pokok",
      dataIndex: "pokok",
      key: "pokok",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Bunga",
      dataIndex: "bunga",
      key: "bunga",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Denda",
      dataIndex: "lateFee",
      key: "lateFee",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "JHT",
      dataIndex: "jht",
      key: "jht",
    },
    {
      title: "Pembayaran",
      dataIndex: "payCCL",
      key: "payCCL",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Tunggak Pokok",
      dataIndex: "sPokok",
      key: "sPokok",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Tunggak Bunga",
      dataIndex: "sBunga",
      key: "sBunga",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Sisa Denda",
      dataIndex: "sLateFee",
      key: "sLateFee",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Sisa Tunggakan",
      dataIndex: "sisaCCL",
      key: "sisaCCL",
      render: (val) => val?.toLocaleString(),
    },
    { title: "Kode Pay", dataIndex: "kodePay", key: "kodePay" },
    {
      title: "Tanggal Update",
      dataIndex: "tgUpdate",
      key: "tgUpdate",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
  ];

  // Column definitions untuk tabel jaminan
  const jaminanColumns = [
    {
      title: "Jenis Jaminan",
      dataIndex: "jenisJaminanNama",
      key: "jenisJaminanNama",
      width: 150,
    },
    {
      title: "ID Jaminan",
      dataIndex: "idJaminan",
      key: "idJaminan",
      width: 120,
    },
    {
      title: "Bukti Kepemilikan",
      dataIndex: "buktiKepemilikan",
      key: "buktiKepemilikan",
      width: 300,
      render: (text) => (
        <div style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Nilai Taksasi",
      dataIndex: "nilaiTaksasi",
      key: "nilaiTaksasi",
      width: 150,
      render: (value) => value?.toLocaleString(),
      align: "right",
    },
    {
      title: "Tanggal Taksasi",
      dataIndex: "tanggalTaksasi",
      key: "tanggalTaksasi",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "No Rek Kredit",
      dataIndex: "noRekKredit",
      key: "noRekKredit",
      width: 150,
    },
  ];

  // Column definitions untuk tabel jaminan kredit
  const jaminanKreditColumns = [
    {
      title: "No Seq",
      dataIndex: "noSeq",
      key: "noSeq",
      width: 80,
      sorter: (a, b) => a.noSeq - b.noSeq,
    },
    {
      title: "Jenis Jaminan",
      dataIndex: "jenisJaminanNama",
      key: "jenisJaminanNama",
      width: 150,
    },
    {
      title: "ID Jaminan",
      dataIndex: "idJaminan",
      key: "idJaminan",
      width: 120,
    },
    {
      title: "Bukti Kepemilikan",
      dataIndex: "buktiKepemilikan",
      key: "buktiKepemilikan",
      width: 300,
      render: (text) => (
        <div style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Nilai Hak Tanggungan",
      dataIndex: "nilaiHakTanggungan",
      key: "nilaiHakTanggungan",
      width: 150,
      render: (value) => value?.toLocaleString(),
      align: "right",
    },
    {
      title: "Nilai Tanggungan Fidusia",
      dataIndex: "nilaiTanggunganFidusia",
      key: "nilaiTanggunganFidusia",
      width: 150,
      render: (value) => value?.toLocaleString(),
      align: "right",
    },
    {
      title: "Nilai Taksasi",
      dataIndex: "nilaiTaksasi",
      key: "nilaiTaksasi",
      width: 150,
      render: (value) => value?.toLocaleString(),
      align: "right",
    },
    {
      title: "Tanggal Taksasi",
      dataIndex: "tanggalTaksasi",
      key: "tanggalTaksasi",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Persen Paripasu",
      dataIndex: "persenParipasu",
      key: "persenParipasu",
      width: 120,
      render: (value) => `${value}%`,
      align: "right",
    },
    {
      title: "Status Paripasu",
      dataIndex: "stsParipasu",
      key: "stsParipasu",
      width: 120,
      align: "center",
    },
    {
      title: "Non PPAP",
      dataIndex: "isNonPPAP",
      key: "isNonPPAP",
      width: 100,
      render: (value) => (value ? "Y" : "T"),
      align: "center",
    },
    {
      title: "Keterangan Non PPAP",
      dataIndex: "ketNonPPAP",
      key: "ketNonPPAP",
      width: 200,
    },
    {
      title: "Kode Jenis Ikat Agunan",
      dataIndex: "kdJnsIkatAgunan",
      key: "kdJnsIkatAgunan",
      width: 150,
    },
    {
      title: "Tanggal Ikat Agunan",
      dataIndex: "tglIkatAgunan",
      key: "tglIkatAgunan",
      width: 150,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 80,
      align: "center",
    },
  ];

  // Render breadcrumb
  const renderBreadcrumb = () => {
    const items = [
      {
        title: <HomeOutlined />,
      },
      {
        title: "Informasi Pinjaman",
      },
    ];

    if (currentStep === "cifList") {
      items.push({ title: "Daftar CIF" });
    } else if (currentStep === "kreditList") {
      items.push(
        { title: "Daftar CIF" },
        { title: `Kredit Rekening - ${selectedCIF?.nama}` }
      );
    } else if (currentStep === "kreditDetail") {
      items.push(
        { title: "Daftar CIF" },
        { title: `Kredit Rekening - ${selectedCIF?.nama}` },
        { title: `Detail - ${selectedKreditRekening?.noRekKredit}` }
      );
    }

    return <Breadcrumb items={items} className="mb-4 bg-white px-3 py-2 rounded-lg border border-gray-100" />;
  };

  // Render search form
  const renderSearchForm = () => (
    <Card
      title={<span className="text-gray-700">Pencarian CIF</span>}
      className="shadow-sm border border-gray-100 rounded-xl"
      extra={
        <Button type="primary" size="middle" icon={<SearchOutlined />} onClick={handleSearchCIF}>
          Cari
        </Button>
      }
    >
      <Row gutter={[12, 12]}>
        <Col span={6}>
          <Input
            allowClear
            size="middle"
            placeholder="Nama"
            value={searchParams.nama}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, nama: e.target.value }))
            }
          />
        </Col>
        <Col span={6}>
          <Input
            allowClear
            size="middle"
            placeholder="No Kartu ID"
            value={searchParams.noKartuID}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                noKartuID: e.target.value,
              }))
            }
          />
        </Col>
        <Col span={6}>
          <Input
            allowClear
            size="middle"
            placeholder="Tempat Lahir"
            value={searchParams.tempatLahir}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                tempatLahir: e.target.value,
              }))
            }
          />
        </Col>
        <Col span={6}>
          <Input
            allowClear
            size="middle"
            placeholder="Nama Ibu Kandung"
            value={searchParams.namaIbuKandung}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                namaIbuKandung: e.target.value,
              }))
            }
            onPressEnter={handleSearchCIF}
          />
        </Col>
      </Row>
    </Card>
  );

  // Render CIF list
  const renderCIFList = () => (
    <Card
      title={<span className="text-gray-700">Daftar CIF</span>}
      className="shadow-sm border border-gray-100 rounded-xl"
    >
      <Table
        size="small"
        columns={cifColumns}
        dataSource={dataCIF?.data}
        rowKey="noCIF"
        scroll={{ x: true }}
        bordered
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );

  // Render kredit list
  const renderKreditList = () => (
    <Card
      title={<span className="text-gray-700">{`Daftar Kredit Rekening - ${selectedCIF?.nama}`}</span>}
      className="shadow-sm border border-gray-100 rounded-xl"
      extra={
        <Space size={8}>
          <span className="text-gray-500">Status Kredit</span>
          <Select value={kreditStatus} onChange={handleStatusChange} style={{ width: 140 }} size="middle">
            <Option value="A">Aktif (A)</Option>
            <Option value="L">Lunas (L)</Option>
          </Select>
        </Space>
      }
    >
      <Table
        size="small"
        columns={kreditColumns}
        dataSource={dataKreditRekening?.data}
        rowKey="noRekKredit"
        scroll={{ x: true }}
        bordered
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );

  // Render kredit detail with tabs
  const renderKreditDetail = () => {
    if (!detailPinjaman?.data?.kreditDetail)
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <Spin size="small" /> Memuat detail...
        </div>
      );

    const calculateOutstanding = (data) => {
      let prevOutstanding = 0;
      return data?.map((item, index) => {
        let currentOutstanding;

        if (index === 0) {
          currentOutstanding = item.nominalCair - item.nominalByr;
        } else {
          currentOutstanding = prevOutstanding - item.nominalByr;
        }

        prevOutstanding = currentOutstanding;

        return {
          ...item,
          outstanding: currentOutstanding,
        };
      });
    };

    const kreditDetail = detailPinjaman.data?.kreditDetail;
    const transaksiData = calculateOutstanding(detailPinjaman.data?.transaksi);
    const tagihanData = detailPinjaman.data?.tagihan || [];
    const jaminanData = detailPinjaman.data?.jaminan || [];
    const jaminanKreditData = detailPinjaman.data?.jaminanKredit || [];

    console.log(kreditDetail);
    console.log("Jaminan Data:", jaminanData);
    console.log("Jaminan Kredit Data:", jaminanKreditData);

    return (
      <Card
        title={<span className="text-gray-700">{`Detail Pinjaman - ${kreditDetail?.noRekKredit}`}</span>}
        className="shadow-sm border border-gray-100 rounded-xl"
        extra={
          <Space size={8} wrap>
            <span className="text-gray-500">Data Tambahan</span>
            <Select
              value={transParameter}
              onChange={handleTransParameterChange}
              style={{ width: 200 }}
              placeholder="Pilih data tambahan"
              size="middle"
            >
              <Option value="T">Transaksi</Option>
              <Option value="AB">Angsuran Bunga</Option>
            </Select>
            <span className="text-gray-500">Data Jaminan</span>
            <Select
              value={jaminanParameter}
              onChange={handleJaminanParameterChange}
              style={{ width: 200 }}
              placeholder="Pilih data jaminan"
              allowClear
              size="middle"
            >
              <Option value="J">Jaminan</Option>
              <Option value="K">Jaminan Kredit</Option>
            </Select>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1" className="[&_.ant-tabs-nav]:mb-4">
          <TabPane tab="Informasi Umum" key="1">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>Nama CIF:</strong> {kreditDetail?.namaCIF}
              </Col>
              <Col span={8}>
                <strong>No Rekening:</strong> {kreditDetail?.noRekKredit}
              </Col>
              <Col span={8}>
                <strong>Nama Rekening:</strong> {kreditDetail?.nmRek}
              </Col>
              <Col span={8}>
                <strong>Produk:</strong> {kreditDetail?.namaProduk}
              </Col>
              <Col span={8}>
                <strong>Fasilitas:</strong> {kreditDetail?.namaFasilitas}
              </Col>
              <Col span={8}>
                <strong>Status:</strong> {kreditDetail?.stsRek}
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Plafon & Pokok" key="2">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>Plafon:</strong>{" "}
                {kreditDetail?.amtPlafon?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Plafon Cair:</strong>{" "}
                {kreditDetail?.amtCairPlafon?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Sisa Plafon Cair:</strong>{" "}
                {kreditDetail?.sisaPlafonCair?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Sisa Pokok:</strong>{" "}
                {kreditDetail?.amtSisaPokok?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Total Tunggak Pokok:</strong>{" "}
                {kreditDetail?.totTunggakPokok?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Pembayaran Pokok:</strong>{" "}
                {kreditDetail?.amtPbyrnPokok?.toLocaleString()}
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Bunga & Denda" key="3">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>Bunga (%):</strong> {kreditDetail?.bngF}
              </Col>
              <Col span={8}>
                <strong>Late Fee (%):</strong> {kreditDetail?.pLateFee}
              </Col>
              <Col span={8}>
                <strong>Total Bunga:</strong>{" "}
                {kreditDetail?.amtTotBunga?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Sisa Bunga:</strong>{" "}
                {kreditDetail?.amtSisaBunga?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Total Tunggak Bunga:</strong>{" "}
                {kreditDetail?.totTunggakBunga?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Total Late Fee:</strong>{" "}
                {kreditDetail?.totLateFee?.toLocaleString()}
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Jangka Waktu" key="4">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>Tanggal Mulai:</strong> {kreditDetail?.tgMulai}
              </Col>
              <Col span={8}>
                <strong>Tanggal Awal:</strong> {kreditDetail?.tgAwal}
              </Col>
              <Col span={8}>
                <strong>Tanggal Akhir:</strong> {kreditDetail?.tgAkhir}
              </Col>
              <Col span={8}>
                <strong>JHT:</strong> {kreditDetail?.jht} hari
              </Col>
              <Col span={8}>
                <strong>Bulan Ke:</strong> {kreditDetail?.blnKe}
              </Col>
              <Col span={8}>
                <strong>Hari Ke:</strong> {kreditDetail?.hariKe}
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Biaya & COA" key="5">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>Biaya Admin:</strong>{" "}
                {kreditDetail?.trByAdm?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Biaya Provisi:</strong>{" "}
                {kreditDetail?.trByProvisi?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Biaya Notaris:</strong>{" "}
                {kreditDetail?.trByNotaris?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>COA Asuransi:</strong> {kreditDetail?.coaByAsuransi}
              </Col>
              <Col span={8}>
                <strong>COA Notaris:</strong> {kreditDetail?.coaByNotaril}
              </Col>
              <Col span={8}>
                <strong>COA Meterai:</strong> {kreditDetail?.coaByMaterai}
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Kolektibilitas & Risiko" key="6">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <strong>Kolektibilitas:</strong> {kreditDetail?.sKolektibilitas}{" "}
                - {kreditDetail?.ketKolek}
              </Col>
              <Col span={8}>
                <strong>PPAP:</strong> {kreditDetail?.ppap?.toLocaleString()}
              </Col>
              <Col span={8}>
                <strong>Sebab Macet:</strong> {kreditDetail?.kdSebabMacet}
              </Col>
              <Col span={8}>
                <strong>File Kredit:</strong> {kreditDetail?.fileKredit}
              </Col>
              <Col span={8}>
                <strong>User Input:</strong> {kreditDetail?.userInput}
              </Col>
              <Col span={8}>
                <strong>User Update:</strong> {kreditDetail?.userUpdate}
              </Col>
            </Row>
          </TabPane>

          {/* Tab for Transaksi */}
          {transParameter === "T" && (
            <TabPane tab="Transaksi" key="transaksi">
              <Table
                size="small"
                columns={transaksiColumns}
                dataSource={transaksiData}
                rowKey={(record, index) => `${record.noSeq}-${index}`}
                bordered
                sticky
                scroll={{ x: true }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} transaksi`,
                }}
              />
            </TabPane>
          )}

          {/* Tab for Tagihan */}
          {transParameter === "AB" && (
            <TabPane tab="Angsuran Bunga" key="tagihan">
              <Table
                size="small"
                columns={tagihanColumns}
                dataSource={tagihanData}
                rowKey={(record, index) => `${record.cclKe}-${index}`}
                bordered
                sticky
                scroll={{ x: true }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} tagihan`,
                }}
              />
            </TabPane>
          )}

          {/* Tab for Jaminan */}
          {jaminanParameter === "J" && jaminanData.length > 0 && (
            <TabPane tab="Jaminan" key="jaminan">
              <Table
                size="small"
                columns={jaminanColumns}
                dataSource={jaminanData}
                rowKey={(record, index) => `${record.idJaminan}-${index}`}
                bordered
                sticky
                scroll={{ x: true }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} jaminan`,
                }}
              />
            </TabPane>
          )}

          {/* Tab for Jaminan Kredit */}
          {jaminanParameter === "K" && jaminanKreditData.length > 0 && (
            <TabPane tab="Jaminan Kredit" key="jaminanKredit">
              <Table
                size="small"
                columns={jaminanKreditColumns}
                dataSource={jaminanKreditData}
                rowKey={(record, index) =>
                  `${record.noSeq}-${record.idJaminan}-${index}`
                }
                bordered
                sticky
                scroll={{ x: true }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} jaminan kredit`,
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <div className="m-0 p-4 bg-gray-50 rounded-md">
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <strong>No Rekening Pinjaman Linked:</strong>{" "}
                          {record.listNoRekKreLink.join(", ")}
                        </Col>
                        <Col span={12}>
                          <strong>Jenis Jaminan:</strong> {record.jenisJaminan}
                        </Col>
                      </Row>
                      {record.ketNonPPAP && (
                        <Row gutter={[16, 8]} className="mt-2">
                          <Col span={24}>
                            <strong>Keterangan Non PPAP:</strong>{" "}
                            {record.ketNonPPAP}
                          </Col>
                        </Row>
                      )}
                    </div>
                  ),
                  rowExpandable: (record) =>
                    record.ketNonPPAP || record.kodeBank,
                }}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Title level={2} className="mb-4 text-gray-800">Informasi Pinjaman</Title>

      {renderBreadcrumb()}

      {currentStep === "search" && renderSearchForm()}
      {currentStep === "cifList" && (
        <Space direction="vertical" style={{ width: "100%" }}>
          {renderSearchForm()}
          {renderCIFList()}
        </Space>
      )}
      {currentStep === "kreditList" && (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button icon={<LeftOutlined />} type="text" onClick={() => setCurrentStep("cifList")} className="mb-2">
            Kembali ke Daftar CIF
          </Button>
          {renderKreditList()}
        </Space>
      )}
      {currentStep === "kreditDetail" && (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button icon={<LeftOutlined />} type="text" onClick={() => setCurrentStep("kreditList")} className="mb-2">
            Kembali ke Daftar Kredit
          </Button>
          {renderKreditDetail()}
        </Space>
      )}
    </div>
  );
};

export default InformasiPinjaman;
