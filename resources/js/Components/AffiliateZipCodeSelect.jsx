import { Select } from 'antd'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Loads zip codes from the server (prefix search). Full list is too large for Inertia + Ant Select children.
 */
export default function AffiliateZipCodeSelect({
  id,
  value,
  onChange,
  status,
  mergeValue,
  placeholder = 'Open dropdown or type to search zip codes',
}) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()

  const ensureMerged = useCallback(
    (opts, merge) => {
      if (!merge) {
        return opts
      }
      if (opts.some((o) => o.value === merge)) {
        return opts
      }
      return [{ value: merge, label: String(merge) }, ...opts]
    },
    []
  )

  const fetchOptions = useCallback(
    async (search) => {
      setLoading(true)
      try {
        const { data } = await axios.get(route('affiliate.zip_codes.search'), {
          params: { search: search ?? '' },
        })
        const codes = data.data || []
        const opts = codes.map((z) => ({ value: z, label: String(z) }))
        const merge = mergeValue ?? value
        setOptions(ensureMerged(opts, merge))
      } finally {
        setLoading(false)
      }
    },
    [ensureMerged, mergeValue, value]
  )

  const scheduleSearch = useCallback(
    (search) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        fetchOptions(search)
      }, 300)
    },
    [fetchOptions]
  )

  useEffect(() => {
    const merge = mergeValue ?? value
    if (!merge) {
      return
    }
    setOptions((prev) => ensureMerged(prev, merge))
  }, [mergeValue, value, ensureMerged])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <Select
      id={id}
      placeholder={placeholder}
      value={value ?? undefined}
      onChange={onChange}
      className="w-full"
      allowClear
      showSearch
      filterOption={false}
      onSearch={scheduleSearch}
      onDropdownVisibleChange={(open) => {
        if (open) {
          fetchOptions('')
        }
      }}
      options={options}
      loading={loading}
      status={status}
      virtual
    />
  )
}
