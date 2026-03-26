export const DateTimeFormat = (value) => {
  let d = new Date(value)
  let hours = d.getHours()
  let minutes = d.getMinutes()
  let ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour "0" should be "12"
  minutes = minutes < 10 ? '0' + minutes : minutes
  let strTime = hours + ':' + minutes + ' ' + ampm
  return (
    d.getDate() +
    '-' +
    new Intl.DateTimeFormat('en', { month: 'short' }).format(d) +
    '-' +
    d.getFullYear().toString().substr(-2) +
    ' ' +
    strTime
  )
}
