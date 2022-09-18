import axios from 'axios'

const addTableDetails = (columnDetails, setColumnDetails, settingsWithoutData, optionKey) => {
  console.log(columnDetails)
  const tmpColumnDetails = { ...columnDetails }
  tmpColumnDetails[optionKey] = settingsWithoutData?.columns
  setColumnDetails(tmpColumnDetails)

  axios
    .post(route('add.table.details'), { columnsData: tmpColumnDetails })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
}
export default addTableDetails
