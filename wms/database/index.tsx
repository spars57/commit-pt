class Database {
  users: UsersTable;

  constructor() {
    this.users = new UsersTable();
  }
}

export default new Database();
