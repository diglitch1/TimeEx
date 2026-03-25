type DateIndexedRow = {
    date: string;
};

export function findIndexAtOrBeforeDate<T extends DateIndexedRow>(
    rows: T[],
    dateStr: string
) {
    let low = 0;
    let high = rows.length - 1;
    let match = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const rowDate = rows[mid].date;

        if (rowDate <= dateStr) {
            match = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return match;
}
