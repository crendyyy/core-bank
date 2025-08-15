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
      className: "font-medium text-gray-800"
    },
    { 
      title: "Nama", 
      dataIndex: "nama", 
      key: "nama",
      className: "font-medium text-gray-800",
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
          className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 rounded-lg shadow-sm"
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
      className: "font-medium",
      render: (val) => (
        <div className="flex items-center space-x-2">
          <BankOutlined className="text-blue-500" />
          <span>{getKantorDisplay(val)}</span>
        </div>
      ),
    },
    { 
      title: "No Rek Kredit", 
      dataIndex: "noRekKredit", 
      key: "noRekKredit",
      width: 150,
      className: "font-medium text-gray-800",
      render: (text) => (
        <Tag color="blue" className="font-mono">{text}</Tag>
      )
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
      render: (val) => (
        <Tag color="geekblue">{getKeterangan("FasilitasKredit", val)}</Tag>
      ),
    },
    {
      title: "Plafon Awal",
      dataIndex: "amtPlafon",
      key: "amtPlafon",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-green-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Out Standing",
      dataIndex: "amtSisaPokok",
      key: "amtSisaPokok",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-orange-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Baki Debet",
      key: "totalSisaTunggak",
      width: 130,
      align: "right",
      render: (_, record) => (
        <div className="text-red-600 font-semibold">
          Rp {(record.amtSisaPokok + record.totTunggakPokok)?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Sisa Plafon",
      dataIndex: "sisaPlafonCair",
      key: "sisaPlafonCair",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-blue-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    { 
      title: "Bunga Flat (%)", 
      dataIndex: "bngF", 
      key: "bngF",
      width: 110,
      align: "center",
      render: (val) => (
        <Tag color="cyan">{val}%</Tag>
      )
    },
    { 
      title: "Denda (%)", 
      dataIndex: "pLateFee", 
      key: "pLateFee",
      width: 100,
      align: "center",
      render: (val) => (
        <Tag color="red">{val}%</Tag>
      )
    },
    { 
      title: "Tanggal Mulai", 
      dataIndex: "tgMulai", 
      key: "tgMulai",
      width: 120,
      render: (val) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <span>{val}</span>
        </div>
      )
    },
    { 
      title: "Tanggal Awal", 
      dataIndex: "tgAwal", 
      key: "tgAwal",
      width: 120,
      render: (val) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <span>{val}</span>
        </div>
      )
    },
    { 
      title: "Tanggal Akhir", 
      dataIndex: "tgAkhir", 
      key: "tgAkhir",
      width: 120,
      render: (val) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <span>{val}</span>
        </div>
      )
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
      render: (val) => (
        <div className="text-purple-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
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
      render: (val) => (
        <Tag color="purple">{getKeterangan("Karyawan", val)}</Tag>
      ),
    },
    {
      title: "Penaksir",
      dataIndex: "idSurveyor",
      key: "idSurveyor",
      width: 150,
      render: (val) => (
        <Tag color="orange">{getKeterangan("Karyawan", val)}</Tag>
      ),
    },
    { 
      title: "Pengusaha", 
      dataIndex: "isPengusaha", 
      key: "isPengusaha",
      width: 100,
      align: "center",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>
          {val ? "Ya" : "Tidak"}
        </Tag>
      )
    },
    {
      title: "Penghasilan/Tahun",
      dataIndex: "penghasilanPerTahun",
      key: "penghasilanPerTahun",
      width: 150,
      align: "right",
      render: (val) => (
        <div className="text-green-600 font-medium">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Nilai Tanah Bangunan",
      dataIndex: "nilaiTnhBgnUsaha",
      key: "nilaiTnhBgnUsaha",
      width: 160,
      align: "right",
      render: (val) => (
        <div className="text-blue-600 font-medium">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Jenis Usaha",
      dataIndex: "kodeJenisUsaha",
      key: "kodeJenisUsaha",
      width: 150,
      render: (val) => (
        <Tag color="geekblue">{getKeterangan("JenisUsaha", val)}</Tag>
      ),
    },
    {
      title: "Kekayaan Bersih",
      dataIndex: "kekayaanBersih",
      key: "kekayaanBersih",
      width: 140,
      align: "right",
      render: (val) => (
        <div className="text-green-600 font-medium">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Sumber Dana Pelunasan",
      dataIndex: "kdSumberDana",
      key: "kdSumberDana",
      width: 180,
      render: (val) => (
        <Tag color="volcano">{getKeterangan("SumberDana", val)}</Tag>
      ),
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
      render: (val) => {
        const color = val === "1" ? "green" : val === "2" ? "blue" : val === "3" ? "orange" : val === "4" ? "red" : "volcano";
        return <Tag color={color}>Kol-{val}</Tag>;
      }
    },
    {
      title: "Tanggal Macet",
      key: "tglMacet",
      width: 120,
      render: (_, record) =>
        record.sKolektibilitas === "5" ? (
          <div className="flex items-center space-x-1 text-red-600">
            <CalendarOutlined />
            <span>{record.tglMacet || "-"}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    { 
      title: "Status", 
      dataIndex: "stsRek", 
      key: "stsRek",
      width: 100,
      align: "center",
      render: (val) => (
        <Tag color={val === "A" ? "green" : "red"}>
          {val === "A" ? "Aktif" : "Nonaktif"}
        </Tag>
      )
    },
    { 
      title: "File Pinjaman", 
      dataIndex: "fileKredit", 
      key: "fileKredit",
      width: 130,
      render: (val) => (
        <div className="flex items-center space-x-1">
          <FileTextOutlined className="text-blue-500" />
          <span>{val}</span>
        </div>
      )
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
          icon={<FileTextOutlined />}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => handleSelectKreditRekening(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  //Columns untuk tabel Transaksi (Trans=T)
  const transaksiColumns = [
    { 
      title: "No", 
      key: "No", 
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <div className="bg-blue-50 text-blue-600 font-medium py-1 px-2 rounded">
          {index + 1}
        </div>
      )
    },
    {
      title: "Tanggal",
      dataIndex: "tanggalTr",
      key: "tanggalTr",
      width: 120,
      render: (val) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-blue-500" />
          <span>{val ? new Date(val).toLocaleDateString() : "-"}</span>
        </div>
      ),
    },
    {
      title: "Nominal Cair",
      dataIndex: "nominalCair",
      key: "nominalCair",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-green-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Nominal Lunas",
      dataIndex: "nominalByr",
      key: "nominalByr",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-blue-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Out Standing",
      dataIndex: "outstanding",
      key: "outstanding",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-orange-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
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
      render: (val) => (
        <Tag color="purple">{val}</Tag>
      )
    },
    { 
      title: "Approve", 
      dataIndex: "userApprove", 
      key: "userApprove",
      width: 120,
      render: (val) => (
        <Tag color="green">{val}</Tag>
      )
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
      render: (val) => (
        <div className="bg-blue-50 text-blue-600 font-medium py-1 px-2 rounded">
          {val}
        </div>
      )
    },
    {
      title: "Tanggal Cicilan",
      dataIndex: "tgCcl",
      key: "tgCcl",
      width: 130,
      render: (val) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-blue-500" />
          <span>{val ? new Date(val).toLocaleDateString() : "-"}</span>
        </div>
      ),
    },
    {
      title: "Out Standing",
      dataIndex: "sisaPok",
      key: "sisaPok",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-orange-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Pokok",
      dataIndex: "pokok",
      key: "pokok",
      width: 120,
      align: "right",
      render: (val) => (
        <div className="text-blue-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Bunga",
      dataIndex: "bunga",
      key: "bunga",
      width: 120,
      align: "right",
      render: (val) => (
        <div className="text-green-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Denda",
      dataIndex: "lateFee",
      key: "lateFee",
      width: 120,
      align: "right",
      render: (val) => (
        <div className="text-red-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
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
      render: (val) => (
        <div className="text-purple-600 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Tunggak Pokok",
      dataIndex: "sPokok",
      key: "sPokok",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-red-500 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Tunggak Bunga",
      dataIndex: "sBunga",
      key: "sBunga",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-red-500 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Sisa Denda",
      dataIndex: "sLateFee",
      key: "sLateFee",
      width: 120,
      align: "right",
      render: (val) => (
        <div className="text-red-500 font-semibold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Sisa Tunggakan",
      dataIndex: "sisaCCL",
      key: "sisaCCL",
      width: 130,
      align: "right",
      render: (val) => (
        <div className="text-orange-600 font-bold">
          Rp {val?.toLocaleString()}
        </div>
      ),
    },
    { 
      title: "Kode Pay", 
      dataIndex: "kodePay", 
      key: "kodePay",
      width: 100,
      align: "center",
      render: (val) => (
        <Tag color="cyan">{val}</Tag>
      )
    },
    {
      title: "Tanggal Update",
      dataIndex: "tgUpdate",
      key: "tgUpdate",
      width: 130,
      render: (val) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-gray-400" />
          <span className="text-gray-600">
            {val ? new Date(val).toLocaleDateString() : "-"}
          </span>
        </div>
      ),
    },
  ];

  // Column definitions untuk tabel jaminan
  const jaminanColumns = [
    {
      title: "Jenis Jaminan",
      dataIndex: "jenisJaminanNama",
      key: "jenisJaminanNama",
      width: 150,
      render: (text) => (
        <div className="flex items-center space-x-2">
          <SafetyOutlined className="text-green-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "ID Jaminan",
      dataIndex: "idJaminan",
      key: "idJaminan",
      width: 120,
      render: (text) => (
        <Tag color="blue" className="font-mono">{text}</Tag>
      ),
    },
    {
      title: "Bukti Kepemilikan",
      dataIndex: "buktiKepemilikan",
      key: "buktiKepemilikan",
      width: 300,
      render: (text) => (
        <div className="bg-gray-50 p-2 rounded border text-sm leading-relaxed">
          {text}
        </div>
      ),
    },
    {
      title: "Nilai Taksasi",
      dataIndex: "nilaiTaksasi",
      key: "nilaiTaksasi",
      width: 150,
      render: (value) => (
        <div className="text-green-600 font-bold text-right">
          Rp {value?.toLocaleString()}
        </div>
      ),
      align: "right",
    },
    {
      title: "Tanggal Taksasi",
      dataIndex: "tanggalTaksasi",
      key: "tanggalTaksasi",
      width: 120,
      render: (date) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-blue-500" />
          <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>
        </div>
      ),
    },
    {
      title: "No Rek Kredit",
      dataIndex: "noRekKredit",
      key: "noRekKredit",
      width: 150,
      render: (text) => (
        <Tag color="purple" className="font-mono">{text}</Tag>
      ),
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
      render: (val) => (
        <div className="bg-blue-50 text-blue-600 font-medium py-1 px-2 rounded">
          {val}
        </div>
      ),
    },
    {
      title: "Jenis Jaminan",
      dataIndex: "jenisJaminanNama",
      key: "jenisJaminanNama",
      width: 150,
      render: (text) => (
        <div className="flex items-center space-x-2">
          <SafetyOutlined className="text-green-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "ID Jaminan",
      dataIndex: "idJaminan",
      key: "idJaminan",
      width: 120,
      render: (text) => (
        <Tag color="blue" className="font-mono">{text}</Tag>
      ),
    },
    {
      title: "Bukti Kepemilikan",
      dataIndex: "buktiKepemilikan",
      key: "buktiKepemilikan",
      width: 300,
      render: (text) => (
        <div className="bg-gray-50 p-2 rounded border text-sm leading-relaxed">
          {text}
        </div>
      ),
    },
    {
      title: "Nilai Hak Tanggungan",
      dataIndex: "nilaiHakTanggungan",
      key: "nilaiHakTanggungan",
      width: 150,
      render: (value) => (
        <div className="text-green-600 font-bold text-right">
          Rp {value?.toLocaleString()}
        </div>
      ),
      align: "right",
    },
    {
      title: "Nilai Tanggungan Fidusia",
      dataIndex: "nilaiTanggunganFidusia",
      key: "nilaiTanggunganFidusia",
      width: 150,
      render: (value) => (
        <div className="text-blue-600 font-bold text-right">
          Rp {value?.toLocaleString()}
        </div>
      ),
      align: "right",
    },
    {
      title: "Nilai Taksasi",
      dataIndex: "nilaiTaksasi",
      key: "nilaiTaksasi",
      width: 150,
      render: (value) => (
        <div className="text-purple-600 font-bold text-right">
          Rp {value?.toLocaleString()}
        </div>
      ),
      align: "right",
    },
    {
      title: "Tanggal Taksasi",
      dataIndex: "tanggalTaksasi",
      key: "tanggalTaksasi",
      width: 120,
      render: (date) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-blue-500" />
          <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>
        </div>
      ),
    },
    {
      title: "Persen Paripasu",
      dataIndex: "persenParipasu",
      key: "persenParipasu",
      width: 120,
      render: (value) => (
        <Tag color="orange" className="font-medium">
          {value}%
        </Tag>
      ),
      align: "center",
    },
    {
      title: "Status Paripasu",
      dataIndex: "stsParipasu",
      key: "stsParipasu",
      width: 120,
      align: "center",
      render: (val) => (
        <Tag color={val === "A" ? "green" : "red"}>
          {val}
        </Tag>
      ),
    },
    {
      title: "Non PPAP",
      dataIndex: "isNonPPAP",
      key: "isNonPPAP",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Ya" : "Tidak"}
        </Tag>
      ),
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
      render: (val) => (
        <Tag color="volcano">{val}</Tag>
      ),
    },
    {
      title: "Tanggal Ikat Agunan",
      dataIndex: "tglIkatAgunan",
      key: "tglIkatAgunan",
      width: 150,
      render: (date) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-blue-500" />
          <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 80,
      align: "center",
      render: (val) => (
        <Tag color={val === "A" ? "green" : "red"}>
          {val}
        </Tag>
      ),
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
        title: (
          <span className="text-blue-600 font-medium">Daftar CIF</span>
        )
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
          title: (
            <span className="text-blue-600 font-medium">
              Kredit Rekening - {selectedCIF?.nama}
            </span>
          )
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
          title: (
            <span className="text-blue-600 font-medium">
              Detail - {selectedKreditRekening?.noRekKredit}
            </span>
          )
        }
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <Breadcrumb items={items} />
      </div>
    );
  };

  // Render search form
  const renderSearchForm = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-500 p-2 rounded-lg">
          <SearchOutlined className="text-white text-lg" />
        </div>
        <div>
          <Title level={4} className="mb-0 text-gray-800">Pencarian CIF</Title>
          <Text type="secondary" className="text-sm">Masukkan minimal satu kriteria pencarian</Text>
        </div>
      </div>
      
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong className="text-gray-700">Nama Lengkap</Text>
            <Input
              placeholder="Masukkan nama lengkap"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchParams.nama}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, nama: e.target.value }))
              }
              className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              size="large"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong className="text-gray-700">No Kartu ID</Text>
            <Input
              placeholder="Masukkan no kartu identitas"
              prefix={<CreditCardOutlined className="text-gray-400" />}
              value={searchParams.noKartuID}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  noKartuID: e.target.value,
                }))
              }
              className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              size="large"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong className="text-gray-700">Tempat Lahir</Text>
            <Input
              placeholder="Masukkan tempat lahir"
              prefix={<CalendarOutlined className="text-gray-400" />}
              value={searchParams.tempatLahir}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  tempatLahir: e.target.value,
                }))
              }
              className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              size="large"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="space-y-2">
            <Text strong className="text-gray-700">Nama Ibu Kandung</Text>
            <Input
              placeholder="Masukkan nama ibu kandung"
              prefix={<SafetyOutlined className="text-gray-400" />}
              value={searchParams.namaIbuKandung}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  namaIbuKandung: e.target.value,
                }))
              }
              onPressEnter={handleSearchCIF}
              className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              size="large"
            />
          </div>
        </Col>
      </Row>
      
      <Divider className="my-6" />
      
      <Row justify="center">
        <Col>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearchCIF}
            size="large"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-8"
          >
            Cari Data CIF
          </Button>
        </Col>
      </Row>
    </div>
  );

  // Render CIF list
  const renderCIFList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <BankOutlined className="text-white text-lg" />
            </div>
            <div>
              <Title level={4} className="mb-0 text-gray-800">Hasil Pencarian CIF</Title>
              <Text type="secondary" className="text-sm">
                Ditemukan {dataCIF?.data?.length || 0} data CIF
              </Text>
            </div>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep("search")}
            className="rounded-lg border-gray-300 hover:border-blue-400 hover:text-blue-500"
          >
            Kembali ke Pencarian
          </Button>
        </div>
      </div>
      
      <div className="p-6">
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
            className: "mt-4"
          }}
          className="modern-table"
          size="middle"
        />
      </div>
    </div>
  );

  // Render kredit list
  const renderKreditList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <CreditCardOutlined className="text-white text-lg" />
            </div>
            <div>
              <Title level={4} className="mb-0 text-gray-800">
                Daftar Kredit Rekening
              </Title>
              <Text type="secondary" className="text-sm">
                CIF: {selectedCIF?.noCIF} - {selectedCIF?.nama}
              </Text>
            </div>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep("cifList")}
            className="rounded-lg border-gray-300 hover:border-blue-400 hover:text-blue-500"
          >
            Kembali ke Daftar CIF
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Text strong className="text-gray-700">Status Kredit:</Text>
            <Select
              value={kreditStatus}
              onChange={handleStatusChange}
              className="w-32"
              size="large"
            >
              <Option value="A">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Aktif</span>
                </div>
              </Option>
              <Option value="L">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Lunas</span>
                </div>
              </Option>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="p-6">
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
            className: "mt-4"
          }}
          className="modern-table"
          size="middle"
        />
      </div>
    </div>
  );

  // Render kredit detail with tabs
  const renderKreditDetail = () => {
    if (!detailPinjaman?.data?.kreditDetail) {
      return (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Text type="secondary">Memuat detail pinjaman...</Text>
          </div>
        </div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <FileTextOutlined className="text-white text-lg" />
              </div>
              <div>
                <Title level={4} className="mb-0 text-gray-800">
                  Detail Pinjaman
                </Title>
                <Text type="secondary" className="text-sm">
                  {kreditDetail?.noRekKredit} - {kreditDetail?.namaCIF}
                </Text>
              </div>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentStep("kreditList")}
              className="rounded-lg border-gray-300 hover:border-blue-400 hover:text-blue-500"
            >
              Kembali ke Daftar Kredit
            </Button>
          </div>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <div className="flex items-center space-x-2">
                <Text strong className="text-gray-700">Data Tambahan:</Text>
                <Select
                  value={transParameter}
                  onChange={handleTransParameterChange}
                  className="flex-1"
                  size="large"
                  placeholder="Pilih data tambahan"
                >
                  <Option value="T">
                    <div className="flex items-center space-x-2">
                      <DollarOutlined className="text-green-500" />
                      <span>Transaksi</span>
                    </div>
                  </Option>
                  <Option value="AB">
                    <div className="flex items-center space-x-2">
                      <CalendarOutlined className="text-blue-500" />
                      <span>Angsuran Bunga</span>
                    </div>
                  </Option>
                </Select>
              </div>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <div className="flex items-center space-x-2">
                <Text strong className="text-gray-700">Data Jaminan:</Text>
                <Select
                  value={jaminanParameter}
                  onChange={handleJaminanParameterChange}
                  className="flex-1"
                  size="large"
                  placeholder="Pilih data jaminan"
                  allowClear
                >
                  <Option value="J">
                    <div className="flex items-center space-x-2">
                      <SafetyOutlined className="text-green-500" />
                      <span>Jaminan</span>
                    </div>
                  </Option>
                  <Option value="K">
                    <div className="flex items-center space-x-2">
                      <SafetyOutlined className="text-purple-500" />
                      <span>Jaminan Kredit</span>
                    </div>
                  </Option>
                </Select>
              </div>
            </Col>
          </Row>
        </div>

        <div className="p-6">
          <Tabs 
            defaultActiveKey="1" 
            type="card"
            className="modern-tabs"
            items={[
              {
                key: "1",
                label: (
                  <div className="flex items-center space-x-2">
                    <FileTextOutlined />
                    <span>Informasi Umum</span>
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <Text type="secondary" className="text-sm font-medium">Nama CIF</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.namaCIF || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <Text type="secondary" className="text-sm font-medium">No Rekening</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1 font-mono">
                        {kreditDetail?.noRekKredit || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <Text type="secondary" className="text-sm font-medium">Nama Rekening</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.nmRek || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                      <Text type="secondary" className="text-sm font-medium">Produk</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.namaProduk || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                      <Text type="secondary" className="text-sm font-medium">Fasilitas</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.namaFasilitas || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <Text type="secondary" className="text-sm font-medium">Status</Text>
                      <div className="mt-1">
                        <Tag color={kreditDetail?.stsRek === "A" ? "green" : "red"} className="text-sm font-medium">
                          {kreditDetail?.stsRek === "A" ? "Aktif" : "Nonaktif"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "2",
                label: (
                  <div className="flex items-center space-x-2">
                    <DollarOutlined />
                    <span>Plafon & Pokok</span>
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <Text type="secondary" className="text-sm font-medium">Plafon</Text>
                      <div className="text-xl font-bold text-green-600 mt-1">
                        Rp {kreditDetail?.amtPlafon?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <Text type="secondary" className="text-sm font-medium">Plafon Cair</Text>
                      <div className="text-xl font-bold text-blue-600 mt-1">
                        Rp {kreditDetail?.amtCairPlafon?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <Text type="secondary" className="text-sm font-medium">Sisa Plafon Cair</Text>
                      <div className="text-xl font-bold text-purple-600 mt-1">
                        Rp {kreditDetail?.sisaPlafonCair?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                      <Text type="secondary" className="text-sm font-medium">Sisa Pokok</Text>
                      <div className="text-xl font-bold text-orange-600 mt-1">
                        Rp {kreditDetail?.amtSisaPokok?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <Text type="secondary" className="text-sm font-medium">Total Tunggak Pokok</Text>
                      <div className="text-xl font-bold text-red-600 mt-1">
                        Rp {kreditDetail?.totTunggakPokok?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                      <Text type="secondary" className="text-sm font-medium">Pembayaran Pokok</Text>
                      <div className="text-xl font-bold text-indigo-600 mt-1">
                        Rp {kreditDetail?.amtPbyrnPokok?.toLocaleString() || "0"}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "3",
                label: (
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined />
                    <span>Bunga & Denda</span>
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200">
                      <Text type="secondary" className="text-sm font-medium">Bunga (%)</Text>
                      <div className="text-2xl font-bold text-cyan-600 mt-1">
                        {kreditDetail?.bngF || "0"}%
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <Text type="secondary" className="text-sm font-medium">Late Fee (%)</Text>
                      <div className="text-2xl font-bold text-red-600 mt-1">
                        {kreditDetail?.pLateFee || "0"}%
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <Text type="secondary" className="text-sm font-medium">Total Bunga</Text>
                      <div className="text-xl font-bold text-green-600 mt-1">
                        Rp {kreditDetail?.amtTotBunga?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <Text type="secondary" className="text-sm font-medium">Sisa Bunga</Text>
                      <div className="text-xl font-bold text-blue-600 mt-1">
                        Rp {kreditDetail?.amtSisaBunga?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                      <Text type="secondary" className="text-sm font-medium">Total Tunggak Bunga</Text>
                      <div className="text-xl font-bold text-yellow-600 mt-1">
                        Rp {kreditDetail?.totTunggakBunga?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <Text type="secondary" className="text-sm font-medium">Total Late Fee</Text>
                      <div className="text-xl font-bold text-purple-600 mt-1">
                        Rp {kreditDetail?.totLateFee?.toLocaleString() || "0"}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "4",
                label: (
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined />
                    <span>Jangka Waktu</span>
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <Text type="secondary" className="text-sm font-medium">Tanggal Mulai</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.tgMulai || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <Text type="secondary" className="text-sm font-medium">Tanggal Awal</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.tgAwal || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <Text type="secondary" className="text-sm font-medium">Tanggal Akhir</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.tgAkhir || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <Text type="secondary" className="text-sm font-medium">JHT</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.jht || "0"} hari
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                      <Text type="secondary" className="text-sm font-medium">Bulan Ke</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.blnKe || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                      <Text type="secondary" className="text-sm font-medium">Hari Ke</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.hariKe || "0"}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "5",
                label: (
                  <div className="flex items-center space-x-2">
                    <DollarOutlined />
                    <span>Biaya & COA</span>
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <Text type="secondary" className="text-sm font-medium">Biaya Admin</Text>
                      <div className="text-xl font-bold text-green-600 mt-1">
                        Rp {kreditDetail?.trByAdm?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <Text type="secondary" className="text-sm font-medium">Biaya Provisi</Text>
                      <div className="text-xl font-bold text-blue-600 mt-1">
                        Rp {kreditDetail?.trByProvisi?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <Text type="secondary" className="text-sm font-medium">Biaya Notaris</Text>
                      <div className="text-xl font-bold text-purple-600 mt-1">
                        Rp {kreditDetail?.trByNotaris?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                      <Text type="secondary" className="text-sm font-medium">COA Asuransi</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1 font-mono">
                        {kreditDetail?.coaByAsuransi || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                      <Text type="secondary" className="text-sm font-medium">COA Notaris</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1 font-mono">
                        {kreditDetail?.coaByNotaril || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <Text type="secondary" className="text-sm font-medium">COA Meterai</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1 font-mono">
                        {kreditDetail?.coaByMaterai || "-"}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "6",
                label: (
                  <div className="flex items-center space-x-2">
                    <SafetyOutlined />
                    <span>Kolektibilitas & Risiko</span>
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <Text type="secondary" className="text-sm font-medium">Kolektibilitas</Text>
                      <div className="mt-1">
                        <Tag 
                          color={
                            kreditDetail?.sKolektibilitas === "1" ? "green" : 
                            kreditDetail?.sKolektibilitas === "2" ? "blue" : 
                            kreditDetail?.sKolektibilitas === "3" ? "orange" : 
                            kreditDetail?.sKolektibilitas === "4" ? "red" : "volcano"
                          } 
                          className="text-sm font-medium"
                        >
                          Kol-{kreditDetail?.sKolektibilitas || "0"}
                        </Tag>
                        <div className="text-sm text-gray-600 mt-1">
                          {kreditDetail?.ketKolek || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <Text type="secondary" className="text-sm font-medium">PPAP</Text>
                      <div className="text-xl font-bold text-green-600 mt-1">
                        Rp {kreditDetail?.ppap?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <Text type="secondary" className="text-sm font-medium">Sebab Macet</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.kdSebabMacet || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <Text type="secondary" className="text-sm font-medium">File Kredit</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.fileKredit || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                      <Text type="secondary" className="text-sm font-medium">User Input</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.userInput || "-"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                      <Text type="secondary" className="text-sm font-medium">User Update</Text>
                      <div className="text-lg font-semibold text-gray-800 mt-1">
                        {kreditDetail?.userUpdate || "-"}
                      </div>
                    </div>
                  </div>
                ),
              },
              // Conditional tabs based on parameters
              ...(transParameter === "T" ? [{
                key: "transaksi",
                label: (
                  <div className="flex items-center space-x-2">
                    <DollarOutlined />
                    <span>Transaksi</span>
                  </div>
                ),
                children: (
                  <div className="bg-white rounded-lg">
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
                      className="modern-table"
                      size="middle"
                    />
                  </div>
                ),
              }] : []),
              ...(transParameter === "AB" ? [{
                key: "tagihan",
                label: (
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined />
                    <span>Angsuran Bunga</span>
                  </div>
                ),
                children: (
                  <div className="bg-white rounded-lg">
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
                      className="modern-table"
                      size="middle"
                    />
                  </div>
                ),
              }] : []),
              ...(jaminanParameter === "J" && jaminanData.length > 0 ? [{
                key: "jaminan",
                label: (
                  <div className="flex items-center space-x-2">
                    <SafetyOutlined />
                    <span>Jaminan</span>
                  </div>
                ),
                children: (
                  <div className="bg-white rounded-lg">
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
                      className="modern-table"
                      size="middle"
                    />
                  </div>
                ),
              }] : []),
              ...(jaminanParameter === "K" && jaminanKreditData.length > 0 ? [{
                key: "jaminanKredit",
                label: (
                  <div className="flex items-center space-x-2">
                    <SafetyOutlined />
                    <span>Jaminan Kredit</span>
                  </div>
                ),
                children: (
                  <div className="bg-white rounded-lg">
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
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg m-2 border border-gray-200">
                            <Row gutter={[16, 8]}>
                              <Col span={12}>
                                <div className="space-y-1">
                                  <Text strong className="text-sm text-gray-700">No Rekening Pinjaman Linked:</Text>
                                  <div className="flex flex-wrap gap-1">
                                    {record.listNoRekKreLink?.map((rek, index) => (
                                      <Tag key={index} color="blue" className="font-mono text-xs">
                                        {rek}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="space-y-1">
                                  <Text strong className="text-sm text-gray-700">Jenis Jaminan:</Text>
                                  <div className="text-sm text-gray-800">
                                    <Tag color="geekblue">{record.jenisJaminan}</Tag>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            {record.ketNonPPAP && (
                              <Row gutter={[16, 8]} className="mt-3">
                                <Col span={24}>
                                  <div className="space-y-1">
                                    <Text strong className="text-sm text-gray-700">Keterangan Non PPAP:</Text>
                                    <div className="bg-white p-2 rounded border text-sm text-gray-800">
                                      {record.ketNonPPAP}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            )}
                          </div>
                        ),
                        rowExpandable: (record) =>
                          record.ketNonPPAP || record.listNoRekKreLink?.length > 0,
                      }}
                      className="modern-table"
                      size="middle"
                    />
                  </div>
                ),
              }] : [])
            ]}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <BankOutlined className="text-2xl" />
              </div>
              <div>
                <Title level={2} className="mb-0 text-white">
                  Informasi Pinjaman
                </Title>
                <Text className="text-blue-100 text-lg">
                  Sistem Manajemen Data Pinjaman dan Kredit
                </Text>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Total CIF</div>
                <div className="text-xl font-bold">
                  {dataCIF?.data?.length || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Total Kredit</div>
                <div className="text-xl font-bold">
                  {dataKreditRekening?.data?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

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