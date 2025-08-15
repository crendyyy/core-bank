const cifKeys = {
  lists: ["cif", "list"],
  listsSelectCIF: ["cif", "lists"],
  list: (filter) => ["cif", "list", { ...filter }],
  DetailCIF: (id) => ["cif", "detail", id],
};

export default cifKeys;
