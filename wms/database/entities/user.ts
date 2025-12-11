class User {
  private uuid: string;
  private username: string;
  private email: string;
  private password: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor() {
    this.uuid = crypto.randomUUID();
    this.username = "";
    this.email = "";
    this.password = "";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public getUuid() {
    return this.uuid;
  }

  public getUsername() {
    return this.username;
  }

  public getEmail() {
    return this.email;
  }

  public getPassword() {
    return this.password;
  }

  public getCreatedAt() {
    return this.createdAt;
  }

  public getUpdatedAt() {
    return this.updatedAt;
  }

  public setUsername(username: string) {
    this.username = username;
  }

  public setEmail(email: string) {
    this.email = email;
  }

  public setPassword(password: string) {
    this.password = password;
  }

  public setUpdatedAt(updatedAt: Date) {
    this.updatedAt = updatedAt;
  }
}
