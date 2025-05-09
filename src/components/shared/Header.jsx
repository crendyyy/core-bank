import { Layout, Button, Avatar, Space, Tooltip, Badge, Divider, Typography } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  UserOutlined, 
  BellOutlined,
  KeyOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

const NavHeader = ({ 
  collapsed, 
  setCollapsed, 
  namaUser, 
  limitUser, 
  data,
  colorPrimary = '#2283F8'
}) => {
  return (
    <Header 
      style={{ 
        padding: '0 24px', 
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        height: 64
      }}
    >
      <div>
        <Button 
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ 
            fontSize: '16px',
            width: 64, 
            height: 64,
            color: colorPrimary
          }}
        />
      </div>
      
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 16
        }}
      >
        <Space size="large">
          <Space 
            size="small" 
            style={{ 
              padding: '4px 12px',
              background: '#f5f5f5',
              borderRadius: 8
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong style={{ fontSize: 14, lineHeight: '18px' }}>{namaUser}</Text>
              <Text type="secondary" style={{ fontSize: 12, lineHeight: '16px' }}>{data?.nmPos}</Text>
            </div>
          </Space>
          
          <Tooltip title="Limit User">
            <Space style={{ color: colorPrimary }}>
              <KeyOutlined style={{ fontSize: 16 }} />
              <Text strong style={{ color: colorPrimary }}>{limitUser}</Text>
            </Space>
          </Tooltip>
        </Space>
      </div>
    </Header>
  );
};

export default NavHeader;