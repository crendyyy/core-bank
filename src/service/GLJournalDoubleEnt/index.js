const GLDoubleEntKeys = {
  lists: ["GLDoubleEnt", "lists"],
  listsCoa: ["Coa", "list"],
  list: (filter) => ["GLDoubleEnt", "list", { ...filter }],
  DetailGLDoubleEnt: (id) => ["detailGLDoubleEnt", "detail", id],
};

export default GLDoubleEntKeys;
