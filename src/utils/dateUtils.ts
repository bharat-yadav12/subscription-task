interface MonthRange {
  start: Date;
  end: Date;
}
export const getCurrentMonthRange = (): MonthRange => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0));

  return { start, end };
};

export const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
export const getMonthEndDisplay = (end: Date): string => {
  const lastDay = new Date(Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate() - 1
  ));
  return formatDate(lastDay);
};



// interface MonthRange {
//   start: Date;
//   end: Date;
// }

// export const getCurrentMonthRange = (): MonthRange => {
//   const now = new Date();
//   const start = new Date(now.getFullYear(), now.getMonth(), 1);
//   const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//   return { start, end };
// };

// export const formatDate = (date: Date): string => {
//   return date.toISOString().split("T")[0];
// };

// export const getMonthEndDisplay = (end: Date): string => {
//   return formatDate(new Date(end.getTime() - 1));
// };