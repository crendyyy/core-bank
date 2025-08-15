const PinjamanKeys = {
  listsKreditRekening: ["KreditRekening", "lists"],
  listsKreditSetup: ["KreditSetup", "lists"],
  listsKodePinjaman: ["KodePinjaman", "list"],
  listKreditRekening: (filter) => ["KreditRekening", "list", { ...filter }],
  listKreditSetup: (filter) => ["KreditSetup", "list", { ...filter }],
  DetailPinjaman: (id) => ["detailPinjaman", "detail", id],
  KreSetup: (id) => ["kreSetup", "setup", id],
};

export default PinjamanKeys;
