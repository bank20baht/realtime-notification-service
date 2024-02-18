import { IsNotEmpty, IsString } from "class-validator";

export class NotificationRequest {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  summary: string;

  constructor(title: string, summary: string) {
    this.title = title;
    this.summary = summary;
  }
}

export class NotificationUpdateStatus {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  constructor(userId: string) {
    this.user_id = userId;
  }
}
