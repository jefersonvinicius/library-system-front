export class Image {
  private constructor(readonly id: number, readonly position: number, readonly url: string) {}

  static fromApi(data: any) {
    return new Image(data.id, data.position, data.url);
  }

  get isImage() {
    return true;
  }

  static isImage(image: any): image is Image {
    return image?.isImage === true;
  }
}
