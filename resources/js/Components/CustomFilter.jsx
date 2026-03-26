import React, { useMemo, useState } from 'react'
import { Select, Input, DatePicker } from 'antd'
import dayjs from 'dayjs'
import Search from '@/Components/Icons/Search.jsx'

const { RangePicker } = DatePicker

const formatFilterLabel = (label) => {
  const normalizedLabel = String(label ?? '')
    .replace(/_/g, ' ')
    .trim()

  if (!normalizedLabel) return ''

  return normalizedLabel
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const CustomFilter = (props) => {
  const { fields, filterValue, setFilterValue } = props
  const [fieldSearchValue, setFieldSearchValue] = useState('')
  const safeFields = useMemo(
    () => (Array.isArray(fields) ? fields.filter((fieldItem) => Boolean(fieldItem?.name)) : []),
    [fields]
  )
  const selectedFieldMap = useMemo(() => {
    const map = {}
    ;(filterValue?.items ?? []).forEach((item) => {
      map[item.field] = item
    })
    return map
  }, [filterValue?.items])

  const getFieldConfig = (fieldName) =>
    safeFields.find((fieldItem) => fieldItem.name === fieldName) ?? safeFields[0]

  const getDefaultValueByOperator = (operator) => {
    if (operator === 'between' || operator === 'dateBetween' || operator === 'dateNotBetween') {
      return { from: '', to: '' }
    }

    return ''
  }

  const buildDefaultItem = (fieldName, fkey = 0) => {
    const fieldConfig = getFieldConfig(fieldName)
    if (!fieldConfig) {
      return null
    }

    const defaultOperator = fieldConfig.operators?.[0]?.name ?? 'is'
    return {
      field: fieldConfig.name,
      operator: defaultOperator,
      value: getDefaultValueByOperator(defaultOperator),
      dataType: fieldConfig.dataType,
      fkey,
    }
  }

  const handleOperatorChange = (fieldName, value) => {
    const normalizeValueByOperator = (nextOperator, currentValue) => {
      if (
        nextOperator === 'between' ||
        nextOperator === 'dateBetween' ||
        nextOperator === 'dateNotBetween'
      ) {
        if (currentValue && typeof currentValue === 'object') {
          return {
            from: currentValue.from ?? '',
            to: currentValue.to ?? '',
          }
        }

        if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
          return { from: currentValue, to: '' }
        }

        return { from: '', to: '' }
      }

      if (currentValue && typeof currentValue === 'object') {
        return currentValue.from ?? currentValue.to ?? ''
      }

      return currentValue ?? ''
    }

    setFilterValue((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.field === fieldName
          ? {
              ...item,
              operator: value,
              value: normalizeValueByOperator(value, item.value),
            }
          : item
      ),
    }))
  }

  const handleValueChange = (fieldName, value, rangeKey = null) => {
    setFilterValue((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.field !== fieldName) {
          return item
        }

        if (
          item.operator === 'between' ||
          item.operator === 'dateBetween' ||
          item.operator === 'dateNotBetween'
        ) {
          const currentRange =
            item.value && typeof item.value === 'object' ? item.value : { from: '', to: '' }

          if (rangeKey) {
            return {
              ...item,
              value: {
                ...currentRange,
                [rangeKey]: value,
              },
            }
          }
        }

        return {
          ...item,
          value,
        }
      }),
    }))
  }

  const handleFieldToggle = (fieldName) => {
    const isChecked = Boolean(selectedFieldMap[fieldName])
    if (isChecked) {
      setFilterValue((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.field !== fieldName),
      }))
      return
    }

    const nextFkey = (filterValue?.items?.[filterValue.items.length - 1]?.fkey ?? -1) + 1
    const defaultItem = buildDefaultItem(fieldName, nextFkey)
    if (!defaultItem) return

    setFilterValue((prev) => ({
      ...prev,
      items: [...prev.items, defaultItem],
    }))
  }

  const filteredFields = safeFields.filter((item) =>
    formatFilterLabel(item.caption ?? item.name ?? '')
      .toLowerCase()
      .includes(fieldSearchValue.toLowerCase())
  )

  return (
    <div className="custom-filter-v2">
      <div className="filter-search-input">
        <Input
          placeholder="Search"
          prefix={<Search />}
          value={fieldSearchValue}
          onChange={(e) => setFieldSearchValue(e.target.value)}
        />
      </div>

      <div className="filter-list">
        {filteredFields.map((field) => {
          const selected = selectedFieldMap[field.name]
          const operators = field.operators ?? []
          return (
            <div className="filter-item" key={field.name}>
              <label className="filter-item-label">
                <input
                  type="checkbox"
                  checked={Boolean(selected)}
                  onChange={() => handleFieldToggle(field.name)}
                />
                <span>{formatFilterLabel(field.caption || field.name)}</span>
              </label>

              {selected ? (
                <div className="filter-item-controls">
                  <Select
                    value={selected.operator}
                    onChange={(value) => handleOperatorChange(field.name, value)}
                    className="w-full"
                  >
                    {operators.map((operator) => (
                      <Select.Option key={operator.name} value={operator.name}>
                        {operator.caption}
                      </Select.Option>
                    ))}
                  </Select>

                  {selected.operator !== 'isEmpty' && selected.operator !== 'isNotEmpty' ? (
                    selected.dataType === 'date' ? (
                      <RangePicker
                        className="w-full"
                        value={[
                          selected?.value?.from ? dayjs(selected.value.from) : null,
                          selected?.value?.to ? dayjs(selected.value.to) : null,
                        ]}
                        onChange={(dates) => {
                          const from = dates?.[0]?.format('YYYY-MM-DD') ?? ''
                          const to = dates?.[1]?.format('YYYY-MM-DD') ?? ''
                          setFilterValue((prev) => ({
                            ...prev,
                            items: prev.items.map((item) =>
                              item.field === field.name ? { ...item, value: { from, to } } : item
                            ),
                          }))
                        }}
                        allowClear
                      />
                    ) : selected.dataType === 'number' && selected.operator === 'between' ? (
                      <div className="between">
                        <Input
                          type="number"
                          placeholder="From"
                          value={selected?.value?.from ?? ''}
                          onChange={(e) => handleValueChange(field.name, e.target.value, 'from')}
                        />
                        <Input
                          type="number"
                          placeholder="To"
                          value={selected?.value?.to ?? ''}
                          onChange={(e) => handleValueChange(field.name, e.target.value, 'to')}
                        />
                      </div>
                    ) : (
                      <Input
                        type={selected.dataType === 'number' ? 'number' : 'text'}
                        placeholder="Search value"
                        value={selected.value}
                        onChange={(e) => handleValueChange(field.name, e.target.value)}
                      />
                    )
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
        {filteredFields.length === 0 ? (
          <div className="filter-empty-state">No matching fields found.</div>
        ) : null}
      </div>
      <div className="filter-footer">
        <Select
          value={filterValue?.groupName ?? 'and'}
          className="w-full"
          onChange={(value) =>
            setFilterValue((prev) => ({
              ...prev,
              groupName: value,
            }))
          }
        >
          <Select.Option value="and">Match all (AND)</Select.Option>
          <Select.Option value="or">Match any (OR)</Select.Option>
        </Select>
        <button
          type="button"
          className="filter-reset"
          onClick={() =>
            setFilterValue((prev) => ({
              ...prev,
              items: [],
            }))
          }
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default CustomFilter
