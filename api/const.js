const tables = {
  users: "users",
  tasks: "tasks",
};

const jwt = {
  secret: "secret-key",
  jwtAlgorithm: "HS256",
  expiresLong: "1d",
  expiresShort: "10s",
};
module.exports = {
  tables,
  jwt,
};
