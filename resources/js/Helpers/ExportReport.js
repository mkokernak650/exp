import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
export const ExportReportWithoutTag = (apiData, fileName) => {
  let mainDataOrigin = 'A1',
    headerLength = 0

  if (apiData.header) {
    if (Object.keys(apiData.header).length) {
      mainDataOrigin = `A${Object.keys(apiData.header).length + 2}`
      headerLength = Object.keys(apiData.header).length
    }
  }

  const ws = XLSX.utils.json_to_sheet(Object.values(apiData.data), { origin: mainDataOrigin })

  if (apiData.header && Object.keys(apiData.header).length) {
    const header = []
    Object.keys(apiData.header).forEach((headerKey) => {
      header.push([headerKey, apiData.header[headerKey]])
    })
    XLSX.utils.sheet_add_aoa(ws, header)
  }

  const secondData = Object.keys(apiData.data).length + 5 + headerLength
  const call_summary = []
  Object.keys(apiData.call_summary).forEach((cf) => {
    call_summary.push([cf, apiData.call_summary[cf]])
  })
  XLSX.utils.sheet_add_aoa(ws, call_summary, { origin: `C${secondData}` })
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: fileType })
  FileSaver.saveAs(data, fileName + '.xlsx')
  toast.success('Report Generated Successfully')
}

export const ExportReportWithTag = (apiData, fileName) => {
  let mainDataOrigin = 'A1',
    headerLength = 0

  if (apiData.header) {
    if (Object.keys(apiData.header).length) {
      mainDataOrigin = `A${Object.keys(apiData.header).length + 2}`
      headerLength = Object.keys(apiData.header).length
    }
  }

  const secondData = apiData.data.length + 5 + headerLength
  const call_summary = []
  call_summary.push(['Summary of Calls', ''])
  Object.keys(apiData.call_summary).forEach((cf) => {
    call_summary.push([cf, apiData.call_summary[cf]])
  })
  const thirdData = apiData.data.length + call_summary.length + 6 + headerLength
  const category = []
  category.push(['Category', 'Total Calls', 'Total Revenue'])
  Object.keys(apiData.tag_count).forEach((cat) => {
    category.push(Object.values(apiData.tag_count[cat]))
  })

  const ws = XLSX.utils.json_to_sheet(apiData.data, { origin: mainDataOrigin })

  if (apiData.header && Object.keys(apiData.header).length) {
    const header = []
    Object.keys(apiData.header).forEach((headerKey) => {
      header.push([headerKey, apiData.header[headerKey]])
    })
    XLSX.utils.sheet_add_aoa(ws, header)
  }

  XLSX.utils.sheet_add_aoa(ws, call_summary, { origin: `C${secondData}` })
  XLSX.utils.sheet_add_aoa(ws, category, { origin: `C${thirdData}` })
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: fileType })
  FileSaver.saveAs(data, fileName + '.xlsx')
  toast.success('Report Generated Successfully')
}

export const exportReportEcommerce = (apiData, fileName, reportOn) => {
  if (reportOn.reportOn === 'exportCSV' && apiData.data === 'csvEmptyTemplateAces') {
    const emptyTemplate = new Blob(
      [
        [
          'Vendor',
          'ProductCode',
          'CreativeCode',
          'Station',
          'Dnis',
          'CallDate',
          'CallTime',
          'ANI',
          'CallerCity',
          'CallerState',
          'CallerZip',
          'CallerCountry',
          'CallerGender',
          'City',
          'State',
          'Zip',
          'Revenue',
          'CallLength',
          'PaymentMethod',
          'R1',
          'R2',
        ],
      ],
      { type: fileType }
    )
    FileSaver.saveAs(emptyTemplate, fileName + '.csv')
    toast.success('Report generated successfully')
    return
  }

  let mainDataOrigin,
    headerLength = 0

  if (Object.keys(apiData.header).length) {
    mainDataOrigin = `A${Object.keys(apiData.header).length + 2}`
    headerLength = Object.keys(apiData.header).length
  } else {
    mainDataOrigin = 'A1'
  }

  const ws = XLSX.utils.json_to_sheet(apiData.data, { origin: mainDataOrigin })

  if (apiData.header && Object.keys(apiData.header).length) {
    const header = []
    Object.keys(apiData.header).forEach((headerKey) => {
      header.push([headerKey, apiData.header[headerKey]])
    })
    XLSX.utils.sheet_add_aoa(ws, header)
  }

  if (apiData?.summary && Object.keys(apiData.summary).length) {
    const secondData = apiData.data.length + 5 + headerLength
    const summary = []
    summary.push(['Summary', ''])
    Object.keys(apiData.summary).forEach((cf) => {
      summary.push([cf, apiData.summary[cf]])
    })

    XLSX.utils.sheet_add_aoa(ws, summary, {
      origin: reportOn.reportOn === 'detail' ? `E${secondData}` : `B${secondData}`,
    })
  }

  const bookType = reportOn.reportOn === 'exportCSV' ? 'csv' : 'xlsx'
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: `${bookType}`, type: 'array' })
  const data = new Blob([excelBuffer], { type: fileType })
  FileSaver.saveAs(data, fileName + `.${bookType}`)
  toast.success('Report generated successfully')
}

export const exportRingbaReports = (apiData, fileName) => {
  let mainDataOrigin,
    headerLength = 0,
    summaryLength = 0

  if (Object.keys(apiData.header).length) {
    mainDataOrigin = `A${Object.keys(apiData.header).length + 2}`
    headerLength = Object.keys(apiData.header).length
  } else {
    mainDataOrigin = 'A1'
  }

  const ws = XLSX.utils.json_to_sheet(apiData.data, { origin: mainDataOrigin })

  if (apiData.header && Object.keys(apiData.header).length) {
    const header = []
    Object.keys(apiData.header).forEach((headerKey) => {
      header.push([headerKey, apiData.header[headerKey]])
    })
    XLSX.utils.sheet_add_aoa(ws, header)
  }

  if (apiData?.summary && Object.keys(apiData.summary).length) {
    const secondData = apiData.data.length + 5 + headerLength
    const summary = []
    summary.push(['Summary', ''])
    Object.keys(apiData.summary).forEach((cf) => {
      summary.push([cf, apiData.summary[cf]])
    })

    summaryLength = summary.length

    XLSX.utils.sheet_add_aoa(ws, summary, { origin: `C${secondData}` })
  }

  if (apiData.tagsData && apiData.tagsData.length) {
    const thirdData = apiData.data.length + 5 + headerLength + summaryLength + 2
    const tagsData = []
    apiData.tagsData.forEach((tagdata) => {
      tagsData.push(tagdata)
    })
    XLSX.utils.sheet_add_aoa(ws, tagsData, { origin: `C${thirdData}` })
  }

  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: fileType })
  FileSaver.saveAs(data, fileName + '.xlsx')
  toast.success('Report generated successfully')
}

export const exportReportAlreadyExist = (apiData) => {
  const ws = XLSX.utils.json_to_sheet(apiData, 'already_exists_sales')
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: fileType })
  FileSaver.saveAs(data, 'already_exists_sales' + '.xlsx')
}

export const exportReportRejectedReturns = (apiData) => {
  const ws = XLSX.utils.json_to_sheet(apiData, 'rejected_returns')
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: fileType })
  FileSaver.saveAs(data, 'rejected_returns' + '.xlsx')
}
