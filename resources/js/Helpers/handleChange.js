const handleChange = (e, setValues) => {
  const { name, value } = e.target
  setValues((oldValues) => ({
    ...oldValues,
    [name]: value,
  }))
}

export default handleChange
