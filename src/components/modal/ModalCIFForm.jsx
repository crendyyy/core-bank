import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Tabs,
  Table,
  Space,
  Modal,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TabPane } = Tabs;

const CIFForm = ({
  form,
  onFinish,
  loading,
  isEdit,
  initialValues,
  selectedCIF,
  isEditOpen,
}) => {
  const [datadarurat, setDataDarurat] = useState([]);
  const [dataPenjamin, setDataPenjamin] = useState([]);
  const [editingDaruratIndex, setEditingDaruratIndex] = useState(null);
  const [editingPenjaminIndex, setEditingPenjaminIndex] = useState(null);
  const [daruratForm] = Form.useForm();
  const [penjaminForm] = Form.useForm();

  const { data: selectData } = useGetAllSelectCIF();
  const createCIFDaruratMutation = useCreateCIFDarurat();
  const updateCIFDaruratMutation = useUpdateCIFDarurat();
  const deleteCIFDaruratMutation = useDeleteCIFDarurat();
  const createCIFPenjaminMutation = useCreateCIFPenjamin();
  const updateCIFPenjaminMutation = useUpdateCIFPenjamin();
  const deleteCIFPenjaminMutation = useDeleteCIFPenjamin();

  useEffect(() => {
    if (initialValues?.cifDarurat) {
      setDataDarurat(initialValues?.cifDarurat);
    }
    if (initialValues?.cifPenjamin) {
      setDataPenjamin(initialValues?.cifPenjamin);
    }
  }, [initialValues]);

  // Helper function to get options by group
  const getOptionsByGroup = (groupName) => {
    if (!selectData?.data || !selectData.data[groupName]) return [];
    return selectData.data[groupName];
  };

  // Helper function to render select options
  const renderSelectOptions = (groupName) => {
    const options = getOptionsByGroup(groupName);
    return options.map((option) => (
      <Option key={option.id} value={option.id}>
        {option.keterangan}
      </Option>
    ));
  };

  const columnsDarurat = [
    {
      title: "Nama Darurat",
      dataIndex: "namaDarurat",
      key: "namaDarurat",
    },
    {
      title: "Hubungan",
      dataIndex: "hubungan",
      key: "hubungan",
    },
    {
      title: "No HP",
      dataIndex: "noHp",
      key: "noHp",
    },
    {
      title: "No Telp",
      dataIndex: "noTelp",
      key: "noTelp",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Alamat KTP",
      dataIndex: "alamatKTP",
      key: "alamatKTP",
    },
    {
      title: "Alamat Domisili",
      dataIndex: "alamatDomisili",
      key: "alamatDomisili",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record, index) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditDarurat(record, index)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDarurat(index)}
          />
        </Space>
      ),
    },
  ];

  // 5. Columns untuk Table Data Penjamin
  const columnsPenjamin = [
    {
      title: "Nama Penjamin",
      dataIndex: "namaPenjamin",
      key: "namaPenjamin",
    },
    {
      title: "Hubungan",
      dataIndex: "hubungan",
      key: "hubungan",
    },
    {
      title: "No HP",
      dataIndex: "noHp",
      key: "noHp",
    },
    {
      title: "No Telp",
      dataIndex: "noTelp",
      key: "noTelp",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Alamat KTP",
      dataIndex: "alamatKTP",
      key: "alamatKTP",
    },
    {
      title: "Alamat Domisili",
      dataIndex: "alamatDomisili",
      key: "alamat",
    },
    {
      title: "Pekerjaan",
      dataIndex: "pekerjaan",
      key: "pekerjaan",
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan",
      key: "jabatan",
    },
    {
      title: "Alamat Pekerjaan",
      dataIndex: "alamatPekerjaan",
      key: "alamatPekerjaan",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
    },
    {
      title: "Aksi",
      key: "aksi",
      fixed: "right",
      render: (_, record, index) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPenjamin(record, index)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePenjamin(index)}
          />
        </Space>
      ),
    },
  ];

  // Update handleAddDarurat - reset form untuk mode create
  const handleAddDarurat = () => {
    setEditingDaruratIndex(null);
    daruratForm.resetFields();
  };

  // Update handleEditDarurat - populate form dengan data yang akan diedit
  const handleEditDarurat = (record, index) => {
    setEditingDaruratIndex(index);
    daruratForm.setFieldsValue(record);
  };

  const handleDeleteDarurat = async (index) => {
    const record = datadarurat[index];

    Modal.confirm({
      title: "Hapus Data Darurat",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      onOk: async () => {
        try {
          if (record.idCIFDarurat) {
            await deleteCIFDaruratMutation.mutateAsync(record.idCIFDarurat);
          }

          const newData = [...datadarurat];
          newData.splice(index, 1);
          setDataDarurat(newData);
          form.setFieldsValue({ cifDarurat: newData });

          // Reset form jika sedang edit data yang dihapus
          if (editingDaruratIndex === index) {
            handleAddDarurat();
          }

          if (!record.idCIFDarurat) {
            message.success("Data darurat berhasil dihapus");
          }
        } catch (error) {
          console.error("Error deleting darurat:", error);
        }
      },
    });
  };

  // Update handleAddPenjamin
  const handleAddPenjamin = () => {
    setEditingPenjaminIndex(null);
    penjaminForm.resetFields();
  };

  // Update handleEditPenjamin
  const handleEditPenjamin = (record, index) => {
    setEditingPenjaminIndex(index);
    penjaminForm.setFieldsValue(record);
  };

  // Update handleDeletePenjamin
  const handleDeletePenjamin = async (index) => {
    const record = dataPenjamin[index];

    Modal.confirm({
      title: "Hapus Data Penjamin",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      onOk: async () => {
        try {
          if (record.idCIFPenjamin) {
            await deleteCIFPenjaminMutation.mutateAsync(record.idCIFPenjamin);
          }

          const newData = [...dataPenjamin];
          newData.splice(index, 1);
          setDataPenjamin(newData);
          form.setFieldsValue({ cifPenjamin: newData });

          // Reset form jika sedang edit data yang dihapus
          if (editingPenjaminIndex === index) {
            handleAddPenjamin();
          }

          if (!record.idCIFPenjamin) {
            message.success("Data penjamin berhasil dihapus");
          }
        } catch (error) {
          console.error("Error deleting penjamin:", error);
        }
      },
    });
  };

  // Fungsi untuk handle submit form darurat
  const handleDaruratSubmit = async (values) => {
    try {
      const dataToSubmit = {
        NoCIF: initialValues?.noCIF,
        NamaDarurat: values.namaDarurat,
        Hubungan: values.hubungan,
        NoHp: values.noHp,
        NoTelp: values.noTelp,
        Email: values.email,
        AlamatKTP: values.alamatKTP,
        AlamatDomisili: values.alamatDomisili,
        Keterangan: values.keterangan,
      };

      if (editingDaruratIndex !== null) {
        // Update existing record
        const existingRecord = datadarurat[editingDaruratIndex];

        if (existingRecord.idCIFDarurat) {
          await updateCIFDaruratMutation.mutateAsync({
            id: existingRecord.idCIFDarurat,
            data: dataToSubmit,
          });
        }

        // Update local state
        const newData = [...datadarurat];
        newData[editingDaruratIndex] = { ...existingRecord, ...values };
        setDataDarurat(newData);
        form.setFieldsValue({ cifDarurat: newData });

        if (!existingRecord.idCIFDarurat) {
          message.success("Data darurat berhasil diupdate");
        }
      } else {
        // Create new record
        if (initialValues?.noCIF) {
          const response = await createCIFDaruratMutation.mutateAsync(
            dataToSubmit
          );
          const newRecord = { ...values, idCIFDarurat: response.data?.id };
          const newData = [...datadarurat, newRecord];
          setDataDarurat(newData);
          form.setFieldsValue({ cifDarurat: newData });
        } else {
          const newData = [...datadarurat, values];
          setDataDarurat(newData);
          form.setFieldsValue({ cifDarurat: newData });
          message.success("Data darurat berhasil ditambahkan");
        }
      }

      // Reset form setelah berhasil
      handleAddDarurat();
    } catch (error) {
      console.error("Error saving darurat:", error);
    }
  };

  // Fungsi untuk handle submit form penjamin
  const handlePenjaminSubmit = async (values) => {
    try {
      const dataToSubmit = {
        NoCIF: initialValues?.noCIF,
        NamaPenjamin: values.namaPenjamin,
        Hubungan: values.hubungan,
        NoHp: values.noHp,
        NoTelp: values.noTelp,
        Email: values.email,
        AlamatKTP: values.alamatKTP,
        AlamatDomisili: values.alamatDomisili,
        AlamatPekerjaan: values.alamatPekerjaan,
        Pekerjaan: values.pekerjaan,
        Jabatan: values.jabatan,
        Keterangan: values.keterangan,
      };

      if (editingPenjaminIndex !== null) {
        // Update existing record
        const existingRecord = dataPenjamin[editingPenjaminIndex];

        if (existingRecord.idCIFPenjamin) {
          await updateCIFPenjaminMutation.mutateAsync({
            id: existingRecord.idCIFPenjamin,
            data: dataToSubmit,
          });
        }
        console.log("Editing Penjamin Index:", editingPenjaminIndex);
        console.log("Updating existing record:", existingRecord);

        // Update local state
        const newData = [...dataPenjamin];
        newData[editingPenjaminIndex] = { ...existingRecord, ...values };
        setDataPenjamin(newData);
        form.setFieldsValue({ cifPenjamin: newData });

        if (!existingRecord.idCIFPenjamin) {
          message.success("Data penjamin berhasil diupdate");
        }
      } else {
        // Create new record
        if (initialValues?.noCIF) {
          const response = await createCIFPenjaminMutation.mutateAsync(
            dataToSubmit
          );
          console.log(response.data);

          const newRecord = {
            ...values,
            idCIFPenjamin: response.data?.data?.idCIFPenjamin,
          };
          const newData = [...dataPenjamin, newRecord];
          setDataPenjamin(newData);
          form.setFieldsValue({ cifPenjamin: newData });
        } else {
          const newData = [...dataPenjamin, values];
          setDataPenjamin(newData);
          form.setFieldsValue({ cifPenjamin: newData });
          message.success("Data penjamin berhasil ditambahkan");
        }
      }

      // Reset form setelah berhasil
      handleAddPenjamin();
    } catch (error) {
      console.error("Error saving penjamin:", error);
    }
  };

  return (
    <Modal
      title={`Edit CIF - ${selectedCIF?.noCIF}`}
      open={isEditOpen}
      onCancel={() => setIsEditOpen(false)}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
      >
        <Tabs defaultActiveKey="umum" className="w-full">
          <TabPane tab="Data Umum" key="umum">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nama"
                  name="nama"
                  rules={[{ required: true, message: "Nama harus diisi" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Nama Lengkap" name="namaLengkap">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Gelar Akademik" name="gelarAkademik">
                  <Select placeholder="Pilih Gelar Akademik">
                    {renderSelectOptions("Gelar")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tanggal Registrasi" name="tglReg">
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Jenis CIF" name="jenisCIF">
                  <Select placeholder="Pilih Jenis CIF">
                    {renderSelectOptions("KodeJenisCIF")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Negara" name="kdNegara">
                  <Select placeholder="Pilih Kode Negara">
                    {renderSelectOptions("KodeNegara")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Alamat Sesuai Identitas"
                  name="alamatSesuaiIdentitas"
                >
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Karyawan" name="karyawan">
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Data Perorangan" key="perorangan">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Tempat Lahir" name="tempatLahir">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tanggal Lahir" name="tglLahir">
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Jenis Kelamin" name="jenisKelamin">
                  <Select placeholder="Pilih Jenis Kelamin">
                    {renderSelectOptions("JenKel")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Status Kawin" name="statusKawin">
                  <Select placeholder="Pilih Status Kawin">
                    {renderSelectOptions("MStatus")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Agama" name="agama">
                  <Select placeholder="Pilih Agama">
                    {renderSelectOptions("Agama")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Agama Lain" name="agamaLain">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kewarganegaraan" name="kewargaNegaraan">
                  <Select placeholder="Pilih Kewarganegaraan">
                    {renderSelectOptions("WargaNegara")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Negara Kewarganegaraan"
                  name="negaraKewargaNegaraan"
                >
                  <Select placeholder="Pilih Negara Kewarganegaraan">
                    {renderSelectOptions("KodeNegara")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Jenis Kartu ID" name="jenisKartuID">
                  <Select placeholder="Pilih Jenis Kartu ID">
                    {renderSelectOptions("JenisID")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="No Kartu ID" name="noKartuID">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Berlaku Sampai" name="berlakuSampai">
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="KTP Seumur Hidup" name="kTPseumurHidup">
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kartu ID Lain" name="kartuIDLain">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Nama Ibu Kandung" name="namaIbuKandung">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="NPWP" name="npwp">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="NPWP Perorangan" name="nPWPperorangan">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Sandi PEP" name="sandiPEP">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Sandi Usaha Risiko Tinggi"
                  name="sandiUsahaRisikoTinggi"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Foto" name="foto">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Data Usaha" key="usaha">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Jabatan" name="jabatan">
                  <Select placeholder="Pilih Jabatan">
                    {renderSelectOptions("Jabatan")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Jabatan" name="kdJabatan">
                  <Select placeholder="Pilih Kode Jabatan">
                    {renderSelectOptions("Jabatan")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Jabatan Perorangan" name="jabatanPerorangan">
                  <Select placeholder="Pilih Jabatan Perorangan">
                    {renderSelectOptions("Jabatan")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Pangkat" name="pangkat">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Lama Bekerja" name="lamaBekerja">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Penghasilan" name="kdPenghasilan">
                  <Select placeholder="Pilih Kode Penghasilan">
                    {renderSelectOptions("Penghasilan")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Penghasilan Per Tahun"
                  name="penghasilanPerTahun"
                >
                  <InputNumber
                    className="w-full"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Alamat Kantor 1" name="alamatKantor1">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Alamat Kantor 2" name="alamatKantor2">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Alamat Kantor 3" name="alamatKantor3">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kota Kantor" name="kotaKantor">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Pos Kantor" name="kdPosKantor">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Telp Kantor" name="telpKantor">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="No Fax Kantor" name="noFaxK">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Jarak Lokasi Usaha" name="jrkLokUsaha">
                  <Select placeholder="Pilih Jarak Lokasi Usaha">
                    {renderSelectOptions("KodeJrkLokUsaha")}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Data Keluarga" key="keluarga">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nama Pasangan" name="nmPasangan">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Jenis Kartu ID Pasangan"
                  name="jnsKartuIDPasangan"
                >
                  <Select placeholder="Pilih Jenis Kartu ID">
                    {renderSelectOptions("JenisID")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="No Kartu ID Pasangan"
                  name="noKartuIDPasangan"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Berlaku ID Pasangan" name="berlakuIDPasangan">
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="KTP Seumur Hidup Pasangan"
                  name="kTPseumurHidupPasangan"
                >
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tempat Lahir Pasangan"
                  name="tmptLahirPasangan"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tanggal Lahir Pasangan"
                  name="tglLahirPasangan"
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="No HP Pasangan" name="noHpPasangan">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="No HP Pasangan 2" name="noHpPasangan2">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Alamat KTP Pasangan" name="alamatKTPPasangan">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Alamat Domisili Pasangan"
                  name="alamatDomisiliPasangan"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tinggal Debitur Pasangan"
                  name="tinggalDebiturPasangan"
                >
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Pekerjaan Pasangan" name="pekerjaanPasangan">
                  <Select placeholder="Pilih Pekerjaan">
                    {renderSelectOptions("Pekerjaan")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Nama PT Pasangan" name="namaPTPasangan">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ada SP Pisah Harta" name="adaSPisahHarta">
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Jumlah Tanggungan" name="jumTanggungan">
                  <InputNumber className="w-full" min={0} max={99} />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Data Darurat" key="darurat">
            <div className="space-y-4">
              {/* Form untuk Create/Update Darurat */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium">
                    {editingDaruratIndex !== null
                      ? "Edit Data Darurat"
                      : "Tambah Data Darurat"}
                  </h4>
                  {editingDaruratIndex !== null && (
                    <Button
                      size="small"
                      onClick={handleAddDarurat}
                      icon={<PlusOutlined />}
                    >
                      Mode Tambah
                    </Button>
                  )}
                </div>

                {/* UBAH: Hapus onFinish dari Form, gunakan onClick pada Button */}
                <Form form={daruratForm} layout="vertical" size="small">
                  <Row gutter={[12, 0]}>
                    <Col span={8}>
                      <Form.Item
                        label="Nama Darurat"
                        name="namaDarurat"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                        className="mb-2"
                      >
                        <Input placeholder="Nama Darurat" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Hubungan"
                        name="hubungan"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                        className="mb-2"
                      >
                        <Input placeholder="Hubungan" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="No HP"
                        name="noHp"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="No HP" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="No Telp"
                        name="noTelp"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="No Telp" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Email"
                        name="email"
                        className="mb-2"
                        rules={[
                          {
                            type: "email",
                            message: "Format email tidak valid",
                          },
                          { required: true, message: "Wajib diisi" },
                        ]}
                      >
                        <Input placeholder="Email" type="email" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Alamat KTP"
                        name="alamatKTP"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="Alamat KTP" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Alamat Domisili"
                        name="alamatDomisili"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="Alamat Domisili" />
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item
                        label="Keterangan"
                        name="keterangan"
                        className="mb-2"
                      >
                        <Input.TextArea rows={2} placeholder="Keterangan" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <div className="flex justify-end gap-2">
                        <Button onClick={handleAddDarurat}>Reset</Button>
                        {/* UBAH: Gunakan onClick handler dan validateFields */}
                        <Button
                          type="primary"
                          loading={
                            createCIFDaruratMutation.isPending ||
                            updateCIFDaruratMutation.isPending
                          }
                          icon={
                            editingDaruratIndex !== null ? (
                              <EditOutlined />
                            ) : (
                              <PlusOutlined />
                            )
                          }
                          onClick={async () => {
                            try {
                              const values = await daruratForm.validateFields();
                              handleDaruratSubmit(values);
                            } catch (error) {
                              console.log("Validation failed:", error);
                            }
                          }}
                        >
                          {editingDaruratIndex !== null ? "Update" : "Tambah"}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>

              {/* Table Data Darurat */}
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Daftar Data Darurat
                </h3>
                <Table
                  columns={columnsDarurat}
                  dataSource={datadarurat}
                  rowKey={(record, index) => record.idCIFDarurat || index}
                  pagination={false}
                  size="small"
                  locale={{
                    emptyText: "Tidak ada data darurat",
                  }}
                  rowClassName={(record, index) =>
                    editingDaruratIndex === index ? "bg-blue-50" : ""
                  }
                />
              </div>
            </div>
          </TabPane>
          <TabPane tab="Data Penjamin" key="penjamin">
            <div className="space-y-4">
              {/* Form untuk Create/Update Penjamin */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium">
                    {editingPenjaminIndex !== null
                      ? "Edit Data Penjamin"
                      : "Tambah Data Penjamin"}
                  </h4>
                  {editingPenjaminIndex !== null && (
                    <Button
                      size="small"
                      onClick={handleAddPenjamin}
                      icon={<PlusOutlined />}
                    >
                      Mode Tambah
                    </Button>
                  )}
                </div>

                {/* UBAH: Hapus onFinish dari Form, gunakan onClick pada Button */}
                <Form form={penjaminForm} layout="vertical" size="small">
                  <Row gutter={[12, 0]}>
                    <Col span={8}>
                      <Form.Item
                        label="Nama Penjamin"
                        name="namaPenjamin"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                        className="mb-2"
                      >
                        <Input placeholder="Nama Penjamin" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Hubungan"
                        name="hubungan"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                        className="mb-2"
                      >
                        <Input placeholder="Hubungan" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="No HP"
                        name="noHp"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="No HP" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="No Telp"
                        name="noTelp"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="No Telp" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Email"
                        name="email"
                        className="mb-2"
                        rules={[
                          {
                            type: "email",
                            message: "Format email tidak valid",
                          },
                          { required: true, message: "Wajib diisi" },
                        ]}
                      >
                        <Input placeholder="Email" type="email" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Pekerjaan"
                        name="pekerjaan"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="Pekerjaan" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Jabatan"
                        name="jabatan"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="Jabatan" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Alamat KTP"
                        name="alamatKTP"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="Alamat KTP" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Alamat Domisili"
                        name="alamatDomisili"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="Alamat Domisili" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Alamat Pekerjaan"
                        name="alamatPekerjaan"
                        className="mb-2"
                        rules={[{ required: true, message: "Wajib diisi" }]}
                      >
                        <Input placeholder="Alamat Pekerjaan" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Keterangan"
                        name="keterangan"
                        className="mb-2"
                      >
                        <Input.TextArea rows={2} placeholder="Keterangan" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <div className="flex justify-end gap-2">
                        <Button onClick={handleAddPenjamin}>Reset</Button>
                        {/* UBAH: Gunakan onClick handler dan validateFields */}
                        <Button
                          type="primary"
                          loading={
                            createCIFPenjaminMutation.isPending ||
                            updateCIFPenjaminMutation.isPending
                          }
                          icon={
                            editingPenjaminIndex !== null ? (
                              <EditOutlined />
                            ) : (
                              <PlusOutlined />
                            )
                          }
                          onClick={async () => {
                            try {
                              const values =
                                await penjaminForm.validateFields();
                              handlePenjaminSubmit(values);
                            } catch (error) {
                              console.log("Validation failed:", error);
                            }
                          }}
                        >
                          {editingPenjaminIndex !== null ? "Update" : "Tambah"}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>

              {/* Table Data Penjamin */}
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Daftar Data Penjamin
                </h3>
                <Table
                  columns={columnsPenjamin}
                  dataSource={dataPenjamin}
                  rowKey={(record, index) => record.idCIFPenjamin || index}
                  pagination={false}
                  scroll={{ x: 1500 }}
                  size="small"
                  locale={{
                    emptyText: "Tidak ada data penjamin",
                  }}
                  rowClassName={(record, index) =>
                    editingPenjaminIndex === index ? "bg-blue-50" : ""
                  }
                />
              </div>
            </div>
          </TabPane>
          <TabPane tab="Data Lainnya" key="lainnya">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Kode Dati 1" name="kdDati1">
                  <Select placeholder="Pilih Kode Dati 1">
                    {renderSelectOptions("Dati1")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Dati 2" name="kdDati2">
                  <Select placeholder="Pilih Kode Dati 2">
                    {renderSelectOptions("Dati2")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Group" name="kdGrp">
                  <Select placeholder="Pilih Kode Group">
                    {renderSelectOptions("Group")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Group 2" name="kdGrp2">
                  <Select placeholder="Pilih Kode Group 2">
                    {renderSelectOptions("Group")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Group 3" name="kdGrp3">
                  <Select placeholder="Pilih Kode Group 3">
                    {renderSelectOptions("Group")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode BH" name="kdBH">
                  <Select placeholder="Pilih Kode Badan Hukum">
                    {renderSelectOptions("BadanHukum")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Gol" name="kdGol">
                  <Select placeholder="Pilih Kode Golongan">
                    {renderSelectOptions("Golongan")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Gol SLIK" name="kdGol_SLIK">
                  <Select placeholder="Pilih Kode Golongan SLIK">
                    {renderSelectOptions("GolSLIK")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kode Gol Nasabah" name="kdGOL_Nasabah">
                  <Select placeholder="Pilih Kode Golongan Nasabah">
                    {renderSelectOptions("SGOLDEB")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Mutlak Kena Pajak" name="mutlakKenaPajak">
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="No Urut Fasilitas" name="noUrutFasilitas">
                  <InputNumber className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Upload 2 Konsol" name="upload2Konsol">
                  <Select placeholder="Pilih">
                    <Option value={true}>Ya</Option>
                    <Option value={false}>Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Is Blokir Tab" name="isBlokirTab">
                  <Select placeholder="Pilih">
                    <Option value={true}>Ya</Option>
                    <Option value={false}>Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="CIF Warning" name="cIFwarning">
                  <Select placeholder="Pilih">
                    <Option value={true}>Ya</Option>
                    <Option value={false}>Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Go Public" name="goPublic">
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Is Perbankan" name="isPerbankan">
                  <Select placeholder="Pilih">
                    <Option value="Y">Ya</Option>
                    <Option value="N">Tidak</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="No CIF Lama" name="noCIFlama">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Struktur Pemilik" name="strukturPemilik">
                  <Select placeholder="Pilih Struktur Pemilik">
                    {renderSelectOptions("KodeStrukturPemilik")}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Info Negatif" name="infoNegatif">
                  <Select placeholder="Pilih Info Negatif">
                    {renderSelectOptions("KodeInfoNegatif")}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button htmlType="button" onClick={() => form.resetFields()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "Update" : "Simpan"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
export default CIFForm;
