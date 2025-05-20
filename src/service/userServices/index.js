const userKeys = {
    currentUser: ["currentUsers", "list"],
    listsUser: ["users", "list"],
    validasiUser: ["validasiUser", "list"],
    listsJabatan: ["jabatan", "list"],
    detailJabatan: (id) => ["jabatan", "detail", id],
  };
  
  export default userKeys;