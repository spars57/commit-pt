class UsersTable {
  private users: User[] = [];

  constructor() {
    //create some fake data
    const user1 = new User();
    user1.setUsername("John Doe");
    user1.setEmail("john.doe@example.com");
    user1.setPassword("password");

    const user2 = new User();
    user2.setUsername("Jane Doe");
    user2.setEmail("jane.doe@example.com");
    user2.setPassword("password");

    this.createUser(user1);
    this.createUser(user2);
  }

  public getUsers() {
    return this.users;
  }

  public getUserByUuid(uuid: string) {
    return this.users.find((user) => user.getUuid() === uuid);
  }

  public getUserByUsername(username: string) {
    return this.users.find((user) => user.getUsername() === username);
  }

  public getUserByEmail(email: string) {
    return this.users.find((user) => user.getEmail() === email);
  }

  public createUser(user: User) {
    this.users.push(user);
  }

  public updateUser(user: User) {
    const index = this.users.findIndex((u) => u.getUuid() === user.getUuid());
    if (index !== -1) this.users[index] = user;
  }

  public deleteUser(uuid: string) {
    const index = this.users.findIndex((u) => u.getUuid() === uuid);
    if (index !== -1) this.users.splice(index, 1);
  }
}
