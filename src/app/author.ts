import { Image } from './image';

export class Author {
  private constructor(
    readonly id: number,
    readonly name: string,
    readonly bio: string,
    readonly birthDate: Date,
    readonly images: Image[],
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  static fromApi(data: any) {
    return new Author(
      data.id,
      data.name,
      data.bio,
      new Date(data.birth_date),
      data.images.map(Image.fromApi),
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}
