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
      <div className="flex flex-wrap flex-col max-w-[600px] mx-auto mt-16 text-center p-5 bg-white shadow rounded">
        <Typography.Title level={3} className="text-center !mb-9">
          Fetch Ringba Data
        </Typography.Title>
        <form validate="true" onSubmit={handleSubmit}>
          <div className="w-[300px] mx-auto mb-4">
            <label className="block text-sm text-left mb-1">
              Data has been fetched up to this date *
            </label>
            <DatePicker
              value={values.start_date ? dayjs(values.start_date) : null}
              onChange={(date, dateString) =>
                handleChange({ target: { name: 'start_date', value: dateString } })
              }
              className="w-full"
            />
          </div>

          <div className="w-[300px] mx-auto mb-4">
            <label className="block text-sm text-left mb-1">End Date *</label>
            <DatePicker
              value={values.end_date ? dayjs(values.end_date) : null}
              onChange={(date, dateString) =>
                handleChange({ target: { name: 'end_date', value: dateString } })
              }
              className="w-full"
            />
          </div>
          <div className="w-[300px] mx-auto mb-4">
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
