import { Input } from 'antd'
import React from 'react'

export default function TextInput({
  label,
  name,
  handleChange,
  type = 'text',
  required = false,
  value,
  error,
  helperText,
  ...rest
}) {
  const InputComponent = type === 'password' ? Input.Password : Input
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm text-gray-600">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <InputComponent
        name={name}
        onChange={handleChange}
        type={type === 'password' ? undefined : type}
        value={value}
        status={error ? 'error' : undefined}
        className="w-full"
        {...rest}
      />
      {helperText && (
        <div className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {helperText}
        </div>
      )}
    </div>
  )
}
