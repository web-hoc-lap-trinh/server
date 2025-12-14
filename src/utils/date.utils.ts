export const getYesterdayDate = (today: Date): Date => {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
};

export const getFormattedDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};