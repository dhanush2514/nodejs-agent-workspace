export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
  ) {
    super(title);
  }
}
