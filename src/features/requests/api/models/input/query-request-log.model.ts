export class QueryRequestLogModel {
  constructor(
    public ip: string,
    public url: string,
    public date: Date,
  ) {}
}
