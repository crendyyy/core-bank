import React, { useState, useEffect, act } from "react";
import {
  Card,
  Typography,
  Select,
  Table,
  Checkbox,
  Button,
  message,
  Spin,
  Tabs,
  Badge,
  Flex,
} from "antd";
import { CopyOutlined, SaveOutlined } from "@ant-design/icons";
import { useGetRoles, useGetRolesAction } from "../service/roles/useGetRoles";
import { useGetRolesAccess } from "../service/roles/useGetRolesAccess";
import {
  useGetAllMenus,
  useGetUserMenusByModule,
  useGetUserPermissions,
} from "../service/menus/useGetMenus";
import { useUpdateRolesAccess } from "../service/roles/useUpdateRoleAccess";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const HakAksesRole = () => {
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState([]); // Untuk melacak perubahan
  const [verticalChecks, setVerticalChecks] = useState({}); // Status checkbox vertikal
  const [changeCount, setChangeCount] = useState(0); // Jumlah menu yang diubah
  const [activeTabKey, setActiveTabKey] = useState(null);
  const [copyFromRoleId, setCopyFromRoleId] = useState(null);
  const [copyingAccess, setCopyingAccess] = useState(false);

  const { data: rolesAction = [] } = useGetRolesAction();
  const { data: menus = [] } = useGetAllMenus();
  const { data: roles = [], isLoading: loadingRoles } = useGetRoles();
  const { data: roleAccess = [], isLoading: loadingAccess } =
    useGetRolesAccess(roleId);
  const { data: sourceRoleAccess = [], isLoading: loadingSourceAccess } =
    useGetRolesAccess(copyFromRoleId);

  const updateRoleAccessMutation = useUpdateRolesAccess(roleId);

    
    const location = useLocation();
    console.log(location.pathname);
    
    const { data: dataMenus } = useGetUserPermissions(location.pathname);
    
    console.log(dataMenus?.data);

  useEffect(() => {
    if (roleId && menus && menus?.data?.length > 0) {
      setLoading(true);

      const allMenuPermissions = menus?.data?.map((menu) => ({
        modId: menu.modID,
        menuId: menu.menuId,
        actions: {},
      }));

      const permissionsMap = {};
      allMenuPermissions.forEach((perm) => {
        const key = `${perm.modId}-${perm.menuId}`;
        permissionsMap[key] = perm;
      });

      if (roleAccess && roleAccess?.data?.length > 0) {
        roleAccess?.data?.forEach((access) => {
          const key = `${access.modId}-${access.menuId}`;
          if (permissionsMap[key]) {
            permissionsMap[key].actions[access.actionId] = access.isAllowed;
          }
        });
      }

      if (rolesAction && rolesAction?.data?.length > 0) {
        allMenuPermissions.forEach((perm) => {
          rolesAction?.data?.forEach((action) => {
            if (perm.actions[action.actionMenuId] === undefined) {
              perm.actions[action.actionMenuId] = false;
            }
          });
        });
      }

      const formattedPermissions = Object.values(permissionsMap);
      setPermissions(formattedPermissions);
      setOriginalPermissions(JSON.parse(JSON.stringify(formattedPermissions)));
      setChangeCount(0);

      const initialVerticalChecks = {};
      if (rolesAction && rolesAction?.data?.length > 0) {
        rolesAction?.data?.forEach((action) => {
          initialVerticalChecks[action.actionMenuId] = {};
          getModules().forEach((module) => {
            initialVerticalChecks[action.actionMenuId][module.id] = false;
          });
        });
      }
      setVerticalChecks(initialVerticalChecks);

      updateVerticalCheckStatus();

      setLoading(false);
    }
  }, [roleId, menus, roleAccess, rolesAction]);

  useEffect(() => {
    if (originalPermissions.length > 0) {
      const changedMenus = new Set();

      permissions.forEach((perm) => {
        const originalPerm = originalPermissions.find(
          (op) => op.modId === perm.modId && op.menuId === perm.menuId
        );

        if (originalPerm) {
          const hasChanges = Object.entries(perm.actions).some(
            ([actionId, isAllowed]) =>
              originalPerm.actions[actionId] !== isAllowed
          );

          if (hasChanges) {
            changedMenus.add(`${perm.modId}-${perm.menuId}`);
          }
        } else {
          changedMenus.add(`${perm.modId}-${perm.menuId}`);
        }
      });

      setChangeCount(changedMenus.size);
    }
  }, [permissions, originalPermissions]);

  useEffect(() => {
    if (permissions.length > 0 && rolesAction?.data?.length > 0) {
      updateVerticalCheckStatus();
    }
  }, [permissions, rolesAction]);

  const updateVerticalCheckStatus = () => {
    if (!rolesAction || !permissions.length) return;

    const newVerticalChecks = { ...verticalChecks };

    getModules().forEach((module) => {
      const moduleMenus = permissions.filter((p) => p.modId === module.id);

      rolesAction?.data?.forEach((action) => {
        const allChecked =
          moduleMenus.length > 0 &&
          moduleMenus.every(
            (menu) => menu.actions[action.actionMenuId] === true
          );

        const someChecked = moduleMenus.some(
          (menu) => menu.actions[action.actionMenuId] === true
        );

        if (!newVerticalChecks[action.actionMenuId]) {
          newVerticalChecks[action.actionMenuId] = {};
        }

        newVerticalChecks[action.actionMenuId][module.id] = allChecked
          ? true
          : someChecked
          ? "indeterminate"
          : false;
      });
    });

    setVerticalChecks(newVerticalChecks);
  };

  useEffect(() => {
    setCopyFromRoleId(null);
  }, [roleId]);

  useEffect(() => {
    if (
      copyFromRoleId &&
      sourceRoleAccess &&
      sourceRoleAccess?.data?.length > 0 &&
      copyingAccess
    ) {
      try {
        const newPermissions = [...permissions];

        newPermissions.forEach((perm) => {
          Object.keys(perm.actions).forEach((actionId) => {
            perm.actions[actionId] = false;
          });
        });

        sourceRoleAccess?.data?.forEach((access) => {
          const permIndex = newPermissions.findIndex(
            (p) => p.modId === access.modId && p.menuId === access.menuId
          );

          if (permIndex !== -1) {
            newPermissions[permIndex].actions[access.actionId] =
              access.isAllowed;
          }
        });

        setPermissions(newPermissions);
        updateVerticalCheckStatus();

        const selectedRoleName =
          roles?.data?.find((r) => r.roleId === copyFromRoleId)?.roleName ||
          "role yang dipilih";
        message.success(`Berhasil menyalin hak akses dari ${selectedRoleName}`);

        setCopyingAccess(false);
        setCopyFromRoleId(null); // Reset selection
      } catch (error) {
        console.error("Failed to copy role access:", error);
        message.error("Gagal menyalin hak akses");
        setCopyingAccess(false);
      }
    }
  }, [sourceRoleAccess, copyFromRoleId, copyingAccess]);

  const copyAccessFromRole = () => {
    if (!copyFromRoleId || copyFromRoleId === roleId) {
      message.warning("Silahkan pilih role lain untuk disalin");
      return;
    }

    setCopyingAccess(true);
  };

  const getActiveModuleId = () => {
    return activeTabKey ? parseInt(activeTabKey) : modules[0]?.id || null;
  };

  const getMenuDetails = (modId, menuId) => {
    if (!menus?.data || !Array.isArray(menus?.data)) {
      return {
        groupName: "Unknown",
        menuName: "Unknown Menu",
        description: "No description",
      };
    }

    const foundMenu = menus?.data?.find(
      (menu) => menu.modID === modId && menu.menuId === menuId
    );

    if (foundMenu) {
      return {
        groupName: foundMenu.groupName,
        menuName: foundMenu.menuName,
        description: foundMenu.ketMenu,
        route: foundMenu.route,
        isAktif: foundMenu.isAktif,
      };
    }

    return {
      groupName: "Unknown",
      menuName: "Unknown Menu",
      description: "No description",
    };
  };

  const getModules = () => {
    if (!menus || !Array.isArray(menus?.data)) {
      return [];
    }

    const uniqueModules = Array.from(
      new Set(
        menus?.data?.map((menu) =>
          JSON.stringify({ id: menu.modID, name: menu.groupName })
        )
      )
    ).map((str) => JSON.parse(str));

    return uniqueModules.sort((a, b) => a.id - b.id);
  };

  const modules = getModules();

  const handlePermissionChange = (modId, menuId, actionId, checked) => {
    setPermissions((prevPermissions) => {
      return prevPermissions.map((perm) => {
        if (perm.modId === modId && perm.menuId === menuId) {
          return {
            ...perm,
            actions: {
              ...perm.actions,
              [actionId]: checked,
            },
          };
        }
        return perm;
      });
    });
  };

  const handleVerticalCheckAll = (actionId, modId, checked) => {
    setPermissions((prevPermissions) => {
      return prevPermissions.map((perm) => {
        if (perm.modId === modId) {
          return {
            ...perm,
            actions: {
              ...perm.actions,
              [actionId]: checked,
            },
          };
        }
        return perm;
      });
    });

    setVerticalChecks((prev) => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        [modId]: checked,
      },
    }));
  };

  const saveChanges = async () => {
    try {
      setSavingChanges(true);

      const updatedPermissions = [];

      permissions.forEach((perm) => {
        const originalPerm = originalPermissions.find(
          (op) => op.modId === perm.modId && op.menuId === perm.menuId
        );

        if (originalPerm) {
          Object.entries(perm.actions).forEach(([actionId, isAllowed]) => {
            if (originalPerm.actions[actionId] !== isAllowed) {
              updatedPermissions.push({
                modId: perm.modId,
                menuId: perm.menuId,
                actionId: parseInt(actionId),
                isAllowed,
              });
            }
          });
        } else {
          Object.entries(perm.actions).forEach(([actionId, isAllowed]) => {
            updatedPermissions.push({
              modId: perm.modId,
              menuId: perm.menuId,
              actionId: parseInt(actionId),
              isAllowed,
            });
          });
        }
      });

      console.log("Saving permissions:", updatedPermissions);
      updateRoleAccessMutation.mutate({ id: roleId, data: updatedPermissions });
      message.success(`Berhasil menyimpan hak akses untuk ${changeCount} menu`);
      setChangeCount(0); // Reset change count after saving
    } catch (error) {
      console.error("Failed to save permissions:", error);
      message.error("Gagal menyimpan hak akses");
    } finally {
      setSavingChanges(false);
    }
  };

  const getActionName = (actionId) => {
    if (!rolesAction || !Array.isArray(rolesAction)) {
      return "Unknown";
    }

    const foundAction = rolesAction?.data?.find(
      (action) => action.actionMenuId === actionId
    );

    return foundAction ? foundAction.actionMenuName : "Unknown";
  };

  const menuColumn = {
    title: "Menu",
    dataIndex: "menuId",
    key: "menu",
    render: (menuId, record) => {
      const menuDetails = getMenuDetails(record.modId, menuId);
      return (
        <div>
          <Text strong>{menuDetails.description}</Text>
        </div>
      );
    },
  };

  const renderCheckAllColumnHeader = (action, moduleId) => {
    const isChecked = verticalChecks[action.actionMenuId]?.[moduleId] === true;
    const isIndeterminate =
      verticalChecks[action.actionMenuId]?.[moduleId] === "indeterminate";

    return (
      <div className="flex flex-col items-center">
        <div className="text-center text-sm font-medium">
          {action.actionMenuName}
        </div>
        {getActiveModuleId() === moduleId && (
          <Checkbox
            checked={isChecked}
            indeterminate={isIndeterminate}
            onChange={(e) =>
              handleVerticalCheckAll(
                action.actionMenuId,
                moduleId,
                e.target.checked
              )
            }
          />
        )}
      </div>
    );
  };

  const generateActionColumns = (moduleId) => {
    if (!rolesAction || !Array.isArray(rolesAction?.data)) return [];

    const sortedActions = [...rolesAction?.data].sort(
      (a, b) => a.actionMenuId - b.actionMenuId
    );

    return sortedActions.map((action) => ({
      title: renderCheckAllColumnHeader(action, moduleId),
      dataIndex: "actions",
      key: action.actionMenuId.toString(),
      align: "center",
      render: (actions, record) => (
        <Checkbox
          checked={actions[action.actionMenuId] || false}
          onChange={(e) =>
            handlePermissionChange(
              record.modId,
              record.menuId,
              action.actionMenuId,
              e.target.checked
            )
          }
        />
      ),
    }));
  };

  const columns = [menuColumn, ...generateActionColumns(getActiveModuleId())];

  return (
    <>
      <Card style={{ borderRadius: "8px", marginBottom: "20px" }}>
        <div className="flex justify-between items-center mb-6">
          <Title level={2} style={{ margin: 0 }}>
            Hak Akses Role
          </Title>
          {roleId && (
            <Flex gap={8} align="center">
              <Select
                placeholder="Salin dari Role"
                value={copyFromRoleId}
                onChange={(value) => setCopyFromRoleId(value)}
                className="w-48"
                popupMatchSelectWidth={false}
                loading={loadingRoles}
                disabled={copyingAccess || savingChanges || loadingSourceAccess}
                options={roles?.data
                  ?.filter((role) => role.roleId !== roleId)
                  .map((role) => ({
                    value: role.roleId,
                    label: role.roleName,
                  }))}
              />
              <Button
                type="default"
                icon={<CopyOutlined />}
                onClick={copyAccessFromRole}
                loading={copyingAccess || loadingSourceAccess}
                disabled={!copyFromRoleId || copyFromRoleId === roleId}
              >
                Salin
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={saveChanges}
                loading={savingChanges}
                disabled={!roleId}
              >
                {changeCount > 0 ? (
                  <>
                    Simpan Perubahan{" "}
                    <Badge
                      count={changeCount}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </Flex>
          )}
        </div>

        <Select
          placeholder="Pilih Role"
          onChange={(value) => setRoleId(value)}
          className="w-full"
          showSearch
          allowClear
          optionFilterProp="label"
          style={{ borderRadius: "10px", marginBottom: "20px" }}
          dropdownStyle={{ borderRadius: "10px" }}
          options={roles?.data?.map((role) => ({
            value: role.roleId,
            label: role.roleName,
          }))}
          loading={loadingRoles}
        />

        {roleId ? (
          loading || loadingAccess ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" tip="Memuat data hak akses..." />
            </div>
          ) : (
            <Tabs
              defaultActiveKey={modules[0]?.id.toString()}
              activeKey={activeTabKey || modules[0]?.id.toString()}
              onChange={(key) => setActiveTabKey(key)}
              tabPosition="left"
              style={{ minHeight: "500px" }}
              items={modules.map((module) => ({
                key: module.id.toString(),
                label: module.name,
                children: (
                  <Table
                    columns={columns}
                    dataSource={permissions.filter(
                      (p) => p.modId === module.id
                    )}
                    rowKey={(record) => `${record.modId}-${record.menuId}`}
                    pagination={false}
                    bordered
                    size="middle"
                    style={{ marginTop: "10px" }}
                  />
                ),
              }))}
            />
          )
        ) : (
          <div className="text-center py-8">
            <Text type="secondary">
              Silakan pilih Role untuk melihat dan mengatur hak akses
            </Text>
          </div>
        )}
      </Card>
    </>
  );
};

export default HakAksesRole;
