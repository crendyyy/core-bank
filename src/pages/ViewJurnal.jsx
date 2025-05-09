import Title from "antd/es/typography/Title";
import { useState } from "react";

const ViewJurnal = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <Title level={2} className="mb-6">
        View Jurnal
      </Title>
    </>
  );
};

export default ViewJurnal;
