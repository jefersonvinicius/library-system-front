export class User {
  private constructor(
    readonly id: number,
    readonly name: string,
    readonly email: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly role: number,
    readonly accessToken: string
  ) {}

  static fromLogin(data: any) {
    return new User(
      data.user.id,
      data.user.name,
      data.user.email,
      new Date(data.user.created_at),
      new Date(data.user.updated_at),
      data.user.role,
      data.access_token
    );
  }
}
