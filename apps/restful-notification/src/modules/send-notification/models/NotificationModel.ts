import { IsString } from "class-validator";

export class NotificationModel {
  @IsString()
  title: string;

  @IsString()
  summary: string;

  constructor(title: string, summary: string) {
    this.title = title;
    this.summary = summary;
  }
}
