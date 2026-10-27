// '2026-10-26' → '2026. 10. 26'. 형식이 다르면 그대로 보여 줌
const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatDay = (day) => {
  const match = typeof day === 'string' && day.match(DAY_PATTERN);
  if (!match) {
    return day;
  }
  const [, year, month, date] = match;
  return `${year}. ${month}. ${date}`;
};

export { formatDay };
