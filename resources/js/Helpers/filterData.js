export const isEmpty = (value) => value == null || value.length === 0;

const contains = (data, item) => {
  if (typeof item.value === 'string') {
    return true;
  } else {
    for (let i = 0; i < item.value.length; i++) {
      if (item.value[i] === data[item.field]) {
        return data;
      }
    }
  }
};
const isEmptyCheck = (data, item) => {
  if (data[item.field] === '') {
    return data;
  }
};
const isNotEmptyCheck = (data, item) => {
  if (data[item.field] !== '') {
    return data;
  }
};

const startWith = (data, item) => {
  if (!item.value) {
    return true;
  }
  const valueLength = item.value.length;
  const subStr = data[item.field].substring(0, valueLength);
  if (data[item.field] !== '') {
    if (subStr.toLowerCase() === item.value.toLowerCase()) {
      return data;
    }
  }
};
const endsWith = (data, item) => {
  if (!item.value) {
    return true;
  }
  const valueLength = item.value.length;
  const fieldLength = data[item.field].length;
  const subStr = data[item.field].substring(
    fieldLength - valueLength,
    fieldLength
  );
  if (data[item.field] !== '') {
    if (subStr.toLowerCase() === item.value.toLowerCase()) {
      return data;
    }
  }
};

const isCheck = (data, item) => {
  if (!item.value) {
    return true;
  }
  if (data[item.field] !== '') {
    if (item.dataType === 'string') {
      if (data[item.field].toLowerCase() === item.value.toLowerCase()) {
        return data;
      }
    } else {
      if (data[item.field] == item.value) {
        return data;
      }
    }
  }
};
const isNotCheck = (data, item) => {
  if (!item.value) {
    return true;
  }
  if (data[item.field] !== '') {
    if (item.dataType === 'string') {
      if (data[item.field].toLowerCase() !== item.value.toLowerCase()) {
        return data;
      }
    } else {
      if (data[item.field] != item.value) {
        return data;
      }
    }
  }
};

const doesNotContain = (data, item) => {

  if (!item.value) {
    return true;
  }
  if (item.dataType === 'string') {
    return !data[item.field].toLowerCase().includes(item.value.toLowerCase());
  } else {
    return !data[item.field].toString().includes(item.value);
  }
};
const equals = (data, item) => {
  let value;
  if (item.value != '' || item.value != null) {
    value = data[item.field];
  } else {
    value = 0;
  }
  if (!item.value) {
    return true;
  }
  return value== item.value
};
const isNotEqual = (data, item) => {
  let value;
  if (item.value != '' || item.value != null) {
    value = data[item.field];
  } else {
    value = 0;
  }
  if (!item.value) {
    return true;
  }
  return value.toString().toLowerCase() !== item.value.toString().toLowerCase();
};

const dateBetween = (data, item) => {
  let value;
  if (item.value != '' || item.value != null) {
    value = data[item.field];
  } else {
    return true;
  }
  const startDate = dateFormat(item.value[0]);
  const endDate = dateFormat(item.value[1]);
  const tableDate = dateFormat(data[item.field]);
  if (tableDate >= startDate && tableDate <= endDate) {
    return true;
  }
};

const between = (data, item) => {
  let value;
  if (item?.value?.from != '' && item?.value?.to != null) {
    value = data[item.field];
  } else {
    return true;
  }
  if (value >= item?.value?.from && value <= item?.value?.to) {
    return true;
  }

};

const dateFormat = (dataParam) => {
  let newDate = new Date(dataParam);
  let shortMonth = newDate.toLocaleString('en-us', { month: 'short' });
  let format_date = newDate;
  let dd = String(format_date.getDate()).padStart(2, '0');
  let yyyy = format_date.getFullYear();
  format_date = dd + '-' + shortMonth + '-' + yyyy;
  return format_date;
};
const more = (data, item) => data[item.field] > item.value;
const less = (data, item) => data[item.field] < item.value;
export const filterItem = (data, filter) => {
  switch (filter.operator) {
    case 'contains':
      return contains(data, filter);
    case 'doesNotContain':
      return doesNotContain(data, filter);
    case 'isEmpty':
      return isEmptyCheck(data, filter);
    case 'isNotEmpty':
      return isNotEmptyCheck(data, filter);
    case 'startswith':
      return startWith(data, filter);
    case 'endsWith':
      return endsWith(data, filter);
    case 'is':
      return isCheck(data, filter);
    case 'isnot':
      return isNotCheck(data, filter);
    case '=':
      return equals(data, filter);
    case '<>':
      return isNotEqual(data, filter);
    case '>':
      return more(data, filter);
    case '<':
      return less(data, filter);
    case 'dateBetween':
      return dateBetween(data, filter);
    case 'between':
      return between(data, filter);
    default:
      throw Error('unknown operator');
  }
};

export const filterGroup = (data, groupName, items) =>
  groupName.toLowerCase() === 'or'
    ? filterGroupOr(data, items)
    : filterGroupAnd(data, items);

export const filterGroupOr = (data, items) => {
  const filteredData = items.reduce((initialData, item) => {
    if (item.items) {
      const grouped = filterGroup(data, item.groupName, item.items);
      return initialData.concat(
        grouped.filter((d) => initialData.indexOf(d) < 0)
      );
    }
    return initialData.concat(
      data.filter((d) => initialData.indexOf(d) < 0 && filterItem(d, item))
    );
  }, []);
  return data.filter((d) => filteredData.includes(d));
};

export const filterGroupAnd = (data, items) => {
  return items.reduce((initialData, item) => {
    if (item.items) {
      return filterGroup(initialData, item.groupName, item.items);
    }
    return initialData.filter((d) => filterItem(d, item));
  }, data);
};

export const filterData = (data, filterValue) => {
  return filterGroup(data, filterValue.groupName, filterValue.items);

};
