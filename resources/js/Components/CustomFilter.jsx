import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MultiSelect from "react-multiple-select-dropdown-lite";
import "react-multiple-select-dropdown-lite/dist/index.css";
import { groups } from "../Helpers/SearchingGroups";
import Trash from "../../images/trash.svg";

const CustomFilter = (props) => {
  const {
    mainData,
    fields,
    filterValue,
    setFilterValue,
    filteredData,
    setFilteredData,
    filterData,
  } = props;
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [betweenData, setbetweenData] = useState({
    from: "",
    to: "",
  });

  const lastFkeyOfArray = filterValue?.items[filterValue?.items?.length - 1]?.fkey;

  const optionsFields = (field) => {
    const arrayUniqueByKey = [
      ...new Map(mainData.map((value) => [value[field], value])).values(),
    ];
    return arrayUniqueByKey.map((item) => ({
      label: item[field],
      value: item[field],
    }));
  };

  const [options, setOptions] = useState(
    optionsFields(filterValue?.items?.[0]?.field)
  );

  const handleChange = (e, key, dateRange, operator) => {
    const newValue = filterValue;
    if (typeof e !== "string") {
      const { name, value } = e.target;
      if (name === "groupname") {
        newValue.groupName = value;
      } else if (name === "field") {
        setOptions(optionsFields(value));
        const selectedIndex = e.target.selectedIndex;
        const optionElement = e.target.childNodes[selectedIndex];
        const { type } = optionElement.dataset;
        newValue.items[key].field = value;
        newValue.items[key].dataType = type;
        newValue.items[key].operator =
          fields[
            fields.findIndex((item) => item.name === value)
          ]?.operators[0].name;
        newValue.items[key].value = "";
      } else if (name === "operator") {
        newValue.items[key].operator = value;
        newValue.items[key].value = "";
      } else if (name === "value") {
        if (operator !== "" && operator === "between") {
          const placeholder = e.target.placeholder;
          let temp = { ...betweenData };
          if (placeholder === "From") {
            temp.from = parseInt(value);
          } else {
            temp.to = parseInt(value);
          }
          setbetweenData(temp);
          newValue.items[key].value = temp;
        } else {
          newValue.items[key].value = value;
        }
      }
    } else if (e === "date-range") {
      setStartDate(dateRange[0]);
      setEndDate(dateRange[1]);
      newValue.items[key].value = dateRange;
    } else if (e === "multi-select") {
      const searchItems = dateRange.split(",");
      newValue.items[key].value = searchItems;
    }
    const result = filterData(mainData, filterValue);
    setFilterValue(newValue);
    setFilteredData(result);
  };

  const addCondition = () => {
    const tempData = { ...filterValue };
    if (tempData?.items.length > 0) {
      tempData.items.push({
        field: tempData.items[0].field,
        operator: tempData.items[0].operator,
        value: tempData.items[0].value,
        dataType: tempData.items[0].dataType,
        fkey: lastFkeyOfArray + 1,
      });
    } else {
      tempData.items.push({
        field: fields?.[0].name,
        operator: fields?.[0]?.operators?.[0].name,
        value: "",
        dataType: fields?.[0].dataType,
        fkey: 0,
      });
      setOptions(optionsFields(filterValue?.items?.[0]?.field));
    }
    setFilterValue(tempData);
  };

  const closeCondition = (itemIndx) => {
    const tempData = { ...filterValue };
    tempData.items.splice(itemIndx, 1);
    setFilterValue(tempData);
    const newValue = filterValue;
    const result = filterData(mainData, filterValue);
    setFilterValue(newValue);
    setFilteredData(result);
  };

  return (
    <>
      <div className="custom-filter">
        <div className="groups">
          <select
            name="groupname"
            onChange={handleChange}
            className="select-box"
          >
            {groups?.map((groupName) => (
              <option value={groupName.name}>{groupName.caption}</option>
            ))}
          </select>
          <div className="add">
            <span className="add-icon" onClick={addCondition}>
              + Add Condition
            </span>
          </div>
        </div>

        {filterValue.items.map((cItem, indx) => (
          <div className="item" key={indx}>
            <div className="cross-icon" onClick={() => closeCondition(indx)}>
              <img src={Trash} alt="delete-icon"></img>
            </div>
            <div className="fields">
              <select
                name="field"
                id="fields"
                onChange={() => handleChange(event, indx)}
              >
                {fields?.map((fieldName, uniqueKey) => (
                  <option
                    value={fieldName.name}
                    data-type={fieldName.dataType}
                    data-fkey={uniqueKey}
                    key={uniqueKey}
                    selected={cItem.field === fieldName.name && fieldName.name}
                  >
                    {fieldName.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="operators">
              <select
                name="operator"
                id="operator"
                onChange={() => handleChange(event, indx)}
              >
                {fields[
                  fields.findIndex((item) => item.name === cItem.field)
                ]?.operators?.map((operator, uniqueKey) => (
                  <option
                    value={operator.name}
                    key={uniqueKey}
                    selected={cItem.operator === operator.name && operator.name}
                  >
                    {operator.caption}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`value ${
                cItem.operator !== "isEmpty" && cItem.operator !== "isNotEmpty"
                  ? "text-field-show"
                  : "text-field-hide"
              }`}
            >
              {cItem.dataType === "string" && cItem.operator !== "contains" ? (
                <input
                  type="text"
                  name="value"
                  onChange={() => handleChange(event, indx)}
                  value={cItem.value}
                  placeholder="value"
                ></input>
              ) : cItem.dataType === "string" &&
                cItem.operator === "contains" ? (
                <MultiSelect
                  onChange={(val) => handleChange("multi-select", indx, val)}
                  options={options}
                />
              ) : cItem.dataType === "date" ? (
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    handleChange("date-range", indx, update);
                  }}
                  isClearable={true}
                />
              ) : cItem.dataType === "number" &&
                cItem.operator !== "between" ? (
                <input
                  type="number"
                  name="value"
                  onChange={() => handleChange(event, indx)}
                  value={cItem.value}
                ></input>
              ) : cItem.dataType === "number" &&
                cItem.operator === "between" ? (
                <div className="between">
                  <input
                    type="text"
                    name="value"
                    from="from"
                    onChange={() => handleChange(event, indx, [], "between")}
                    placeholder="From"
                  ></input>
                  <input
                    type="text"
                    name="value"
                    data-to="to"
                    onChange={() => handleChange(event, indx, [], "between")}
                    placeholder="To"
                  ></input>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CustomFilter;
