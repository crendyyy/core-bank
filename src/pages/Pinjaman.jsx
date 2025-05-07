import Title from 'antd/es/typography/Title'
import { useState } from 'react'

const Pinjaman = () => {
  const [count, setCount] = useState(0)

  return (
    <>
       <Title level={2} className="mb-6">
          Pinjaman
        </Title>
    </>
  )
}

export default Pinjaman
