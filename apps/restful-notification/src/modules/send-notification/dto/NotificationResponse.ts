export interface IAnnouncementType {
  id: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  announcement_id: string;
  announcement_type: IAnnouncementType;
  published_date: string;
  pin_on: string;
  title: string;
  is_read: boolean;
  summary: string;
}

export interface INotificationListResponse {
  notification: INotification[];
}
