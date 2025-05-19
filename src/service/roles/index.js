const rolesKeys = {
  lists: ["roles", "lists"],
  listsRolesAccess: ["rolesAccess", "lists"],
  listsRolesAction: ["rolesAction", "lists"],
  list: (filter) => ["roles", "list", { ...filter }],
  detail: (id) => ["roles", "detail", id],
  detailRoleAccess: (id) => ["roleAccess", "detail", id],
};

export default rolesKeys;