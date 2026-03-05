import axios from 'axios'

const addTableDetails = (columnDetails, setColumnDetails, columns, optionKey) => {
  const tmpColumnDetails = { ...columnDetails }
  tmpColumnDetails[optionKey] = columns
  setColumnDetails(tmpColumnDetails)

  axios
    .post(route('add.table.details'), { columnsData: tmpColumnDetails })
    .then(() => {})
    .catch((err) => {
      console.log(err)
    })
}
export default addTableDetails
