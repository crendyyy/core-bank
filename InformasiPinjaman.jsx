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
  Typography,
  Divider,
  Tag,
} from "antd";
import { 
  SearchOutlined, 
  HomeOutlined, 
  ArrowLeftOutlined,
  CreditCardOutlined,
  BankOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import { useGetCIF } from "../service/CIF/useGetCIF";
import { useGetDetailPinjaman } from "../service/Pinjaman/useGetKreditDetail";
import { useGetKreditRekening } from "../service/Pinjaman/useGetKreditRekening";
import { useGetKreditSetup } from "../service/Pinjaman/useGetKreditSetup";
import { useGetKodePinjaman } from "../service/Pinjaman/useGetKodePinjaman";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

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
    { 
      title: "No CIF", 
      dataIndex: "noCIF", 
      key: "noCIF",
      width: 120,
      className: "font-medium"
    },
    { 
      title: "Nama", 
      dataIndex: "nama", 
      key: "nama",
      className: "font-medium",
      ellipsis: true
    },
    { 
      title: "No Kartu ID", 
      dataIndex: "noKartuID", 
      key: "noKartuID",
      width: 150
    },
    { 
      title: "Jenis Kelamin", 
      dataIndex: "jenisKelamin", 
      key: "jenisKelamin",
      width: 120,
      align: "center"
    },
    { 
      title: "Tempat Lahir", 
      dataIndex: "tempatLahir", 
      key: "tempatLahir",
      width: 130
    },
    { 
      title: "Tanggal Lahir", 
      dataIndex: "tglLahir", 
      key: "tglLahir",
      width: 120
    },
    {
      title: "Alamat",
      key: "alamat",
      ellipsis: true,
      render: (_, record) =>
        `${record.alamatRumah1 || ""} ${record.alamatRumah2 || ""} ${
          record.alamatRumah3 || ""
        }`.trim(),
    },
    { 
      title: "Telp Genggam", 
      dataIndex: "telpGenggam", 
      key: "telpGenggam",
      width: 130
    },
    {
      title: "Nama Ibu Kandung",
      dataIndex: "namaIbuKandung",
      key: "namaIbuKandung",
      ellipsis: true,
      width: 150
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleSelectCIF(record)}
        >
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
      width: 130,
      render: (val) => getKantorDisplay(val),
    },
    { 
      title: "No Rek Kredit", 
      dataIndex: "noRekKredit", 
      key: "noRekKredit",
      width: 150,
      className: "font-medium",
    },
    { 
      title: "Nama Rekening", 
      dataIndex: "nmRek", 
      key: "nmRek",
      ellipsis: true,
      className: "font-medium"
    },
    {
      title: "Jenis Fasilitas",
      dataIndex: "sJFK",
      key: "sJFK",
      width: 150,
      render: (val) => getKeterangan("FasilitasKredit", val),
    },
    {
      title: "Plafon Awal",
      dataIndex: "amtPlafon",
      key: "amtPlafon",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Out Standing",
      dataIndex: "amtSisaPokok",
      key: "amtSisaPokok",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Baki Debet",
      key: "totalSisaTunggak",
      width: 130,
      align: "right",
      render: (_, record) => `Rp ${(record.amtSisaPokok + record.totTunggakPokok)?.toLocaleString()}`,
    },
    {
      title: "Sisa Plafon",
      dataIndex: "sisaPlafonCair",
      key: "sisaPlafonCair",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    { 
      title: "Bunga Flat (%)", 
      dataIndex: "bngF", 
      key: "bngF",
      width: 110,
      align: "center",
    },
    { 
      title: "Denda (%)", 
      dataIndex: "pLateFee", 
      key: "pLateFee",
      width: 100,
      align: "center",
    },
    { 
      title: "Tanggal Mulai", 
      dataIndex: "tgMulai", 
      key: "tgMulai",
      width: 120,
    },
    { 
      title: "Tanggal Awal", 
      dataIndex: "tgAwal", 
      key: "tgAwal",
      width: 120,
    },
    { 
      title: "Tanggal Akhir", 
      dataIndex: "tgAkhir", 
      key: "tgAkhir",
      width: 120,
    },
    { 
      title: "Adendum Ke", 
      dataIndex: "adendumKe", 
      key: "adendumKe",
      width: 100,
      align: "center"
    },
    { 
      title: "JWB", 
      dataIndex: "jwb", 
      key: "jwb",
      width: 80,
      align: "center"
    },
    {
      title: "Angsuran Bulanan",
      dataIndex: "amtCPB",
      key: "amtCPB",
      width: 140,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    { 
      title: "Angsuran Ke", 
      dataIndex: "blnKe", 
      key: "blnKe",
      width: 100,
      align: "center"
    },
    {
      title: "Marketing",
      dataIndex: "kdKaryawan",
      key: "kdKaryawan",
      width: 150,
      render: (val) => getKeterangan("Karyawan", val),
    },
    {
      title: "Penaksir",
      dataIndex: "idSurveyor",
      key: "idSurveyor",
      width: 150,
      render: (val) => getKeterangan("Karyawan", val),
    },
    { 
      title: "Pengusaha", 
      dataIndex: "isPengusaha", 
      key: "isPengusaha",
      width: 100,
      align: "center",
      render: (val) => val ? "Ya" : "Tidak",
    },
    {
      title: "Penghasilan/Tahun",
      dataIndex: "penghasilanPerTahun",
      key: "penghasilanPerTahun",
      width: 150,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Nilai Tanah Bangunan",
      dataIndex: "nilaiTnhBgnUsaha",
      key: "nilaiTnhBgnUsaha",
      width: 160,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Jenis Usaha",
      dataIndex: "kodeJenisUsaha",
      key: "kodeJenisUsaha",
      width: 150,
      render: (val) => getKeterangan("JenisUsaha", val),
    },
    {
      title: "Kekayaan Bersih",
      dataIndex: "kekayaanBersih",
      key: "kekayaanBersih",
      width: 140,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Sumber Dana Pelunasan",
      dataIndex: "kdSumberDana",
      key: "kdSumberDana",
      width: 180,
      render: (val) => getKeterangan("SumberDana", val),
    },
    {
      title: "Sumber Dana Lain",
      dataIndex: "sumberDanaLain",
      key: "sumberDanaLain",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Kolektibilitas",
      dataIndex: "sKolektibilitas",
      key: "sKolektibilitas",
      width: 120,
      align: "center",
      render: (val) => `Kol-${val}`,
    },
    {
      title: "Tanggal Macet",
      key: "tglMacet",
      width: 120,
      render: (_, record) =>
        record.sKolektibilitas === "5" ? record.tglMacet || "-" : "-",
    },
    { 
      title: "Status", 
      dataIndex: "stsRek", 
      key: "stsRek",
      width: 100,
      align: "center",
    },
    { 
      title: "File Pinjaman", 
      dataIndex: "fileKredit", 
      key: "fileKredit",
      width: 130,
    },
    { 
      title: "PIC", 
      dataIndex: "noPIC", 
      key: "noPIC",
      width: 100
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelectKreditRekening(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  // Columns untuk tabel Transaksi (Trans=T)
  const transaksiColumns = [
    { 
      title: "No", 
      key: "No", 
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tanggal",
      dataIndex: "tanggalTr",
      key: "tanggalTr",
      width: 120,
      render: (val) => val ? new Date(val).toLocaleDateString() : "-",
    },
    {
      title: "Nominal Cair",
      dataIndex: "nominalCair",
      key: "nominalCair",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Nominal Lunas",
      dataIndex: "nominalByr",
      key: "nominalByr",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Out Standing",
      dataIndex: "outstanding",
      key: "outstanding",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    { 
      title: "Keterangan", 
      dataIndex: "keterangan", 
      key: "keterangan",
      ellipsis: true,
      width: 200
    },
    { 
      title: "User", 
      dataIndex: "usertr", 
      key: "usertr",
      width: 120,
    },
    { 
      title: "Approve", 
      dataIndex: "userApprove", 
      key: "userApprove",
      width: 120,
    },
  ];

  //Columns untuk tabel Tagihan (Trans=AB)
  const tagihanColumns = [
    { 
      title: "Cicilan Ke", 
      dataIndex: "cclKe", 
      key: "cclKe",
      width: 100,
      align: "center",
    },
    {
      title: "Tanggal Cicilan",
      dataIndex: "tgCcl",
      key: "tgCcl",
      width: 130,
      render: (val) => val ? new Date(val).toLocaleDateString() : "-",
    },
    {
      title: "Out Standing",
      dataIndex: "sisaPok",
      key: "sisaPok",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Pokok",
      dataIndex: "pokok",
      key: "pokok",
      width: 120,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Bunga",
      dataIndex: "bunga",
      key: "bunga",
      width: 120,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Denda",
      dataIndex: "lateFee",
      key: "lateFee",
      width: 120,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "JHT",
      dataIndex: "jht",
      key: "jht",
      width: 80,
      align: "center",
    },
    {
      title: "Pembayaran",
      dataIndex: "payCCL",
      key: "payCCL",
      width: 120,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Tunggak Pokok",
      dataIndex: "sPokok",
      key: "sPokok",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Tunggak Bunga",
      dataIndex: "sBunga",
      key: "sBunga",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Sisa Denda",
      dataIndex: "sLateFee",
      key: "sLateFee",
      width: 120,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    {
      title: "Sisa Tunggakan",
      dataIndex: "sisaCCL",
      key: "sisaCCL",
      width: 130,
      align: "right",
      render: (val) => `Rp ${val?.toLocaleString()}`,
    },
    { 
      title: "Kode Pay", 
      dataIndex: "kodePay", 
      key: "kodePay",
      width: 100,
      align: "center",
    },
    {
      title: "Tanggal Update",
      dataIndex: "tgUpdate",
      key: "tgUpdate",
      width: 130,
      render: (val) => val ? new Date(val).toLocaleDateString() : "-",
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
      render: (value) => `Rp ${value?.toLocaleString()}`,
      align: "right",
    },
    {
      title: "Tanggal Taksasi",
      dataIndex: "tanggalTaksasi",
      key: "tanggalTaksasi",
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
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
      align: "center",
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
      render: (value) => `Rp ${value?.toLocaleString()}`,
      align: "right",
    },
    {
      title: "Nilai Tanggungan Fidusia",
      dataIndex: "nilaiTanggunganFidusia",
      key: "nilaiTanggunganFidusia",
      width: 150,
      render: (value) => `Rp ${value?.toLocaleString()}`,
      align: "right",
    },
    {
      title: "Nilai Taksasi",
      dataIndex: "nilaiTaksasi",
      key: "nilaiTaksasi",
      width: 150,
      render: (value) => `Rp ${value?.toLocaleString()}`,
      align: "right",
    },
    {
      title: "Tanggal Taksasi",
      dataIndex: "tanggalTaksasi",
      key: "tanggalTaksasi",
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Persen Paripasu",
      dataIndex: "persenParipasu",
      key: "persenParipasu",
      width: 120,
      render: (value) => `${value}%`,
      align: "center",
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
      render: (value) => value ? "Ya" : "Tidak",
      align: "center",
    },
    {
      title: "Keterangan Non PPAP",
      dataIndex: "ketNonPPAP",
      key: "ketNonPPAP",
      width: 200,
      ellipsis: true,
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
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
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
        title: (
          <div 
            className="flex items-center space-x-1 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => setCurrentStep("search")}
          >
            <HomeOutlined />
            <span>Beranda</span>
          </div>
        ),
      },
      {
        title: "Informasi Pinjaman",
      },
    ];

    if (currentStep === "cifList") {
      items.push({ 
        title: <span className="text-blue-500 font-medium">Daftar CIF</span>
      });
    } else if (currentStep === "kreditList") {
      items.push(
        { 
          title: (
            <span 
              className="cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => setCurrentStep("cifList")}
            >
              Daftar CIF
            </span>
          )
        },
        { 
          title: <span className="text-blue-500 font-medium">Kredit Rekening - {selectedCIF?.nama}</span>
        }
      );
    } else if (currentStep === "kreditDetail") {
      items.push(
        { 
          title: (
            <span 
              className="cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => setCurrentStep("cifList")}
            >
              Daftar CIF
            </span>
          )
        },
        { 
          title: (
            <span 
              className="cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => setCurrentStep("kreditList")}
            >
              Kredit Rekening - {selectedCIF?.nama}
            </span>
          )
        },
        { 
          title: <span className="text-blue-500 font-medium">Detail - {selectedKreditRekening?.noRekKredit}</span>
        }
      );
    }

    return (
      <Card className="mb-6">
        <Breadcrumb items={items} />
      </Card>
    );
  };

  // Render search form
  const renderSearchForm = () => (
    <Card title="Pencarian CIF" className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong>Nama Lengkap</Text>
            <Input
              placeholder="Masukkan nama lengkap"
              value={searchParams.nama}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, nama: e.target.value }))
              }
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong>No Kartu ID</Text>
            <Input
              placeholder="Masukkan no kartu identitas"
              value={searchParams.noKartuID}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  noKartuID: e.target.value,
                }))
              }
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong>Tempat Lahir</Text>
            <Input
              placeholder="Masukkan tempat lahir"
              value={searchParams.tempatLahir}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  tempatLahir: e.target.value,
                }))
              }
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong>Nama Ibu Kandung</Text>
            <Input
              placeholder="Masukkan nama ibu kandung"
              value={searchParams.namaIbuKandung}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  namaIbuKandung: e.target.value,
                }))
              }
              onPressEnter={handleSearchCIF}
            />
          </div>
        </Col>
      </Row>
      
      <Divider />
      
      <Row justify="center">
        <Col>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearchCIF}
          >
            Cari Data CIF
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // Render CIF list
  const renderCIFList = () => (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <span>Hasil Pencarian CIF ({dataCIF?.data?.length || 0} data)</span>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep("search")}
          >
            Kembali ke Pencarian
          </Button>
        </div>
      }
    >
      <Table
        columns={cifColumns}
        dataSource={dataCIF?.data}
        rowKey="noCIF"
        scroll={{ x: true }}
        pagination={{
          total: dataCIF?.data?.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} dari ${total} data CIF`,
        }}
      />
    </Card>
  );

  // Render kredit list
  const renderKreditList = () => (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <div>
            <div>Daftar Kredit Rekening</div>
            <Text type="secondary" className="text-sm">
              CIF: {selectedCIF?.noCIF} - {selectedCIF?.nama}
            </Text>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep("cifList")}
          >
            Kembali ke Daftar CIF
          </Button>
        </div>
      }
      extra={
        <div className="flex items-center space-x-2">
          <Text strong>Status Kredit:</Text>
          <Select
            value={kreditStatus}
            onChange={handleStatusChange}
            style={{ width: 120 }}
          >
            <Option value="A">Aktif</Option>
            <Option value="L">Lunas</Option>
          </Select>
        </div>
      }
    >
      <Table
        columns={kreditColumns}
        dataSource={dataKreditRekening?.data}
        rowKey="noRekKredit"
        scroll={{ x: true }}
        pagination={{
          total: dataKreditRekening?.data?.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} dari ${total} kredit rekening`,
        }}
      />
    </Card>
  );

  // Render kredit detail with tabs
  const renderKreditDetail = () => {
    if (!detailPinjaman?.data?.kreditDetail) {
      return (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Text type="secondary">Memuat detail pinjaman...</Text>
          </div>
        </Card>
      );
    }

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

    return (
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div>
              <div>Detail Pinjaman</div>
              <Text type="secondary" className="text-sm">
                {kreditDetail?.noRekKredit} - {kreditDetail?.namaCIF}
              </Text>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentStep("kreditList")}
            >
              Kembali ke Daftar Kredit
            </Button>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="flex items-center space-x-2">
              <Text strong>Data Tambahan:</Text>
              <Select
                value={transParameter}
                onChange={handleTransParameterChange}
                style={{ width: "100%" }}
              >
                <Option value="T">Transaksi</Option>
                <Option value="AB">Angsuran Bunga</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <div className="flex items-center space-x-2">
              <Text strong>Data Jaminan:</Text>
              <Select
                value={jaminanParameter}
                onChange={handleJaminanParameterChange}
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="J">Jaminan</Option>
                <Option value="K">Jaminan Kredit</Option>
              </Select>
            </div>
          </Col>
        </Row>

        <Divider />

        <Tabs 
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Informasi Umum",
              children: (
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Text type="secondary">Nama CIF</Text>
                    <div className="font-medium">{kreditDetail?.namaCIF || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">No Rekening</Text>
                    <div className="font-medium">{kreditDetail?.noRekKredit || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Nama Rekening</Text>
                    <div className="font-medium">{kreditDetail?.nmRek || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Produk</Text>
                    <div className="font-medium">{kreditDetail?.namaProduk || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Fasilitas</Text>
                    <div className="font-medium">{kreditDetail?.namaFasilitas || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Status</Text>
                    <div className="font-medium">{kreditDetail?.stsRek === "A" ? "Aktif" : "Nonaktif"}</div>
                  </Col>
                </Row>
              ),
            },
            {
              key: "2",
              label: "Plafon & Pokok",
              children: (
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Text type="secondary">Plafon</Text>
                    <div className="font-medium">Rp {kreditDetail?.amtPlafon?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Plafon Cair</Text>
                    <div className="font-medium">Rp {kreditDetail?.amtCairPlafon?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Sisa Plafon Cair</Text>
                    <div className="font-medium">Rp {kreditDetail?.sisaPlafonCair?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Sisa Pokok</Text>
                    <div className="font-medium">Rp {kreditDetail?.amtSisaPokok?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Total Tunggak Pokok</Text>
                    <div className="font-medium">Rp {kreditDetail?.totTunggakPokok?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Pembayaran Pokok</Text>
                    <div className="font-medium">Rp {kreditDetail?.amtPbyrnPokok?.toLocaleString() || "0"}</div>
                  </Col>
                </Row>
              ),
            },
            {
              key: "3",
              label: "Bunga & Denda",
              children: (
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Text type="secondary">Bunga (%)</Text>
                    <div className="font-medium">{kreditDetail?.bngF || "0"}%</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Late Fee (%)</Text>
                    <div className="font-medium">{kreditDetail?.pLateFee || "0"}%</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Total Bunga</Text>
                    <div className="font-medium">Rp {kreditDetail?.amtTotBunga?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Sisa Bunga</Text>
                    <div className="font-medium">Rp {kreditDetail?.amtSisaBunga?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Total Tunggak Bunga</Text>
                    <div className="font-medium">Rp {kreditDetail?.totTunggakBunga?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Total Late Fee</Text>
                    <div className="font-medium">Rp {kreditDetail?.totLateFee?.toLocaleString() || "0"}</div>
                  </Col>
                </Row>
              ),
            },
            {
              key: "4",
              label: "Jangka Waktu",
              children: (
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Text type="secondary">Tanggal Mulai</Text>
                    <div className="font-medium">{kreditDetail?.tgMulai || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Tanggal Awal</Text>
                    <div className="font-medium">{kreditDetail?.tgAwal || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Tanggal Akhir</Text>
                    <div className="font-medium">{kreditDetail?.tgAkhir || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">JHT</Text>
                    <div className="font-medium">{kreditDetail?.jht || "0"} hari</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Bulan Ke</Text>
                    <div className="font-medium">{kreditDetail?.blnKe || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Hari Ke</Text>
                    <div className="font-medium">{kreditDetail?.hariKe || "0"}</div>
                  </Col>
                </Row>
              ),
            },
            {
              key: "5",
              label: "Biaya & COA",
              children: (
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Text type="secondary">Biaya Admin</Text>
                    <div className="font-medium">Rp {kreditDetail?.trByAdm?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Biaya Provisi</Text>
                    <div className="font-medium">Rp {kreditDetail?.trByProvisi?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Biaya Notaris</Text>
                    <div className="font-medium">Rp {kreditDetail?.trByNotaris?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">COA Asuransi</Text>
                    <div className="font-medium">{kreditDetail?.coaByAsuransi || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">COA Notaris</Text>
                    <div className="font-medium">{kreditDetail?.coaByNotaril || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">COA Meterai</Text>
                    <div className="font-medium">{kreditDetail?.coaByMaterai || "-"}</div>
                  </Col>
                </Row>
              ),
            },
            {
              key: "6",
              label: "Kolektibilitas & Risiko",
              children: (
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Text type="secondary">Kolektibilitas</Text>
                    <div className="font-medium">
                      Kol-{kreditDetail?.sKolektibilitas || "0"}
                      {kreditDetail?.ketKolek && (
                        <div className="text-sm text-gray-500">{kreditDetail.ketKolek}</div>
                      )}
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">PPAP</Text>
                    <div className="font-medium">Rp {kreditDetail?.ppap?.toLocaleString() || "0"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Sebab Macet</Text>
                    <div className="font-medium">{kreditDetail?.kdSebabMacet || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">File Kredit</Text>
                    <div className="font-medium">{kreditDetail?.fileKredit || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">User Input</Text>
                    <div className="font-medium">{kreditDetail?.userInput || "-"}</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">User Update</Text>
                    <div className="font-medium">{kreditDetail?.userUpdate || "-"}</div>
                  </Col>
                </Row>
              ),
            },
            // Conditional tabs based on parameters
            ...(transParameter === "T" ? [{
              key: "transaksi",
              label: "Transaksi",
              children: (
                <Table
                  columns={transaksiColumns}
                  dataSource={transaksiData}
                  rowKey={(record, index) => `${record.noSeq}-${index}`}
                  scroll={{ x: true }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} dari ${total} transaksi`,
                  }}
                />
              ),
            }] : []),
            ...(transParameter === "AB" ? [{
              key: "tagihan",
              label: "Angsuran Bunga",
              children: (
                <Table
                  columns={tagihanColumns}
                  dataSource={tagihanData}
                  rowKey={(record, index) => `${record.cclKe}-${index}`}
                  scroll={{ x: true }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} dari ${total} tagihan`,
                  }}
                />
              ),
            }] : []),
            ...(jaminanParameter === "J" && jaminanData.length > 0 ? [{
              key: "jaminan",
              label: "Jaminan",
              children: (
                <Table
                  columns={jaminanColumns}
                  dataSource={jaminanData}
                  rowKey={(record, index) => `${record.idJaminan}-${index}`}
                  scroll={{ x: true }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} dari ${total} jaminan`,
                  }}
                />
              ),
            }] : []),
            ...(jaminanParameter === "K" && jaminanKreditData.length > 0 ? [{
              key: "jaminanKredit",
              label: "Jaminan Kredit",
              children: (
                <Table
                  columns={jaminanKreditColumns}
                  dataSource={jaminanKreditData}
                  rowKey={(record, index) =>
                    `${record.noSeq}-${record.idJaminan}-${index}`
                  }
                  scroll={{ x: true }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} dari ${total} jaminan kredit`,
                  }}
                  expandable={{
                    expandedRowRender: (record) => (
                      <div className="p-4 bg-gray-50 rounded">
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <Text strong className="text-sm">No Rekening Pinjaman Linked:</Text>
                            <div className="mt-1">
                              {record.listNoRekKreLink?.map((rek, index) => (
                                <Tag key={index} className="mr-1 mb-1">{rek}</Tag>
                              ))}
                            </div>
                          </Col>
                          <Col span={12}>
                            <Text strong className="text-sm">Jenis Jaminan:</Text>
                            <div className="mt-1">{record.jenisJaminan}</div>
                          </Col>
                        </Row>
                        {record.ketNonPPAP && (
                          <Row className="mt-3">
                            <Col span={24}>
                              <Text strong className="text-sm">Keterangan Non PPAP:</Text>
                              <div className="mt-1 p-2 bg-white rounded border text-sm">
                                {record.ketNonPPAP}
                              </div>
                            </Col>
                          </Row>
                        )}
                      </div>
                    ),
                    rowExpandable: (record) =>
                      record.ketNonPPAP || record.listNoRekKreLink?.length > 0,
                  }}
                />
              ),
            }] : [])
          ]}
        />
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="mb-0">Informasi Pinjaman</Title>
              <Text type="secondary">Sistem Manajemen Data Pinjaman dan Kredit</Text>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total CIF</div>
                <div className="text-xl font-bold text-blue-500">
                  {dataCIF?.data?.length || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Kredit</div>
                <div className="text-xl font-bold text-blue-500">
                  {dataKreditRekening?.data?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {renderBreadcrumb()}

        {currentStep === "search" && renderSearchForm()}
        {currentStep === "cifList" && (
          <Space direction="vertical" className="w-full" size="large">
            {renderSearchForm()}
            {renderCIFList()}
          </Space>
        )}
        {currentStep === "kreditList" && renderKreditList()}
        {currentStep === "kreditDetail" && renderKreditDetail()}
      </div>
    </div>
  );
};

export default InformasiPinjaman;