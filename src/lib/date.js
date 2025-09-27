/**
 * Formats a given Date object into a 'YYYY-MM-DD' string.
 * @param {Date} d The Date object to format.
 * @returns {string} The formatted date string in 'YYYY-MM-DD' format.
 */
export function formatYYYYMMDD(d){
    // get the full year (4 digits)
    const year = d.getFullYear();

    // get the month (1–12) and day (1–31), each padded with a leading zero if needed
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`
}
console.log(formatYYYYMMDD(new Date()))