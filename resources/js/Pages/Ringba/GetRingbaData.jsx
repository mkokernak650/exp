import { useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { Helmet } from 'react-helmet'
import { currentDate } from '../../Helpers/CurrentDate'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const GetRingbaData = () => {
  const { lastDataFetchedDate } = usePage().props

  const getEndDate = () => {
    const createCurrentDate = new Date(currentDate())
    if (lastDataFetchedDate.length) {
      const lastFetchedDate = new Date(lastDataFetchedDate[0].end_date)
      const dateDifference = createCurrentDate.getTime() - lastFetchedDate.getTime()
      if (dateDifference > 0) {
        return currentDate()
      }
      return lastDataFetchedDate[0].end_date
    }
    return currentDate()
  }

  const [values, setValues] = useState({
    start_date: lastDataFetchedDate.length > 0 ? lastDataFetchedDate[0].end_date : currentDate(),
    end_date: getEndDate(),
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .post(route('fetch.ringba.data'), values)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          toast.success(res.data.msg)
        } else {
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setLoading(false)
        toast.error('Data Fetching Failed')
      })
  }

  return (
    <div>
      <Helmet title="Get Ringba Data" />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: 600,
          margin: 'auto',
          flexDirection: 'column',
          marginTop: 60,
          textAlign: 'center',
          padding: 20,
        }}
        className="bg-white shadow rounded"
      >
        <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: 35 }}>
          Fetch Ringba Data
        </Typography.Title>
        <form validate="true" onSubmit={handleSubmit}>
          <div style={{ margin: 10, width: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            <label className="block text-sm mb-1">Data has been fetched up to this date</label>
            <DatePicker
              value={values.start_date ? dayjs(values.start_date) : null}
              onChange={(date, dateString) => handleChange({ target: { name: 'start_date', value: dateString } })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ margin: 10, width: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            <label className="block text-sm mb-1">End Date</label>
            <DatePicker
              value={values.end_date ? dayjs(values.end_date) : null}
              onChange={(date, dateString) => handleChange({ target: { name: 'end_date', value: dateString } })}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ margin: 10, width: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Get Ringba Data
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

GetRingbaData.layout = (page) => <Layout title="Get Ringba Data">{page}</Layout>
export default GetRingbaData
