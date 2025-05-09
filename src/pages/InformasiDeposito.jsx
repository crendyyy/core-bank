import Title from "antd/es/typography/Title";
import { useState } from "react";

const InformasiDeposito = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <Title level={2} className="mb-6">
        Informasi Deposito
      </Title>
    </>
  );
};

export default InformasiDeposito;
