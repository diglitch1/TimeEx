export type NotificationTone = 'gain' | 'loss' | 'info';

export type GameNotification = {
    id: string;
    tone: NotificationTone;
    title: string;
    message: string;
    timestampLabel: string;
    read: boolean;
    sourceKey?: string;
};

export type NotificationDraft = {
    tone: NotificationTone;
    title: string;
    message: string;
    timestampLabel: string;
    sourceKey?: string;
};
