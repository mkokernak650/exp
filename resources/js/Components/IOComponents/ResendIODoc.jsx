import { Spin, Tooltip } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ResendIODoc({ data, routeName }) {
  const [loading, setLoading] = useState(false)
  const dataArray = data.split(',')
  const status = dataArray[0]
  const ioNo = dataArray[1]

  const resendIoDocument = () => {
    setLoading(true)
    axios
      .post(route(routeName, { ioNo, type: 'reSend' }))
      .then((response) => {
        if (response.data.success === true) {
          toast.success(response.data.msg)
          setLoading(false)
        } else {
          toast.error(response.data.msg)
          setLoading(false)
        }
      })
      .catch((err) => {
        toast.error('Something went wrong!')
        setLoading(false)
      })
  }

  return (
    <>
      {status === 'accepted' ? (
        <button className={`resend ${loading ? 'resend-disabled' : ''}`} onClick={resendIoDocument}>
          {loading && (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 15, color: '#fff' }} />}
              size="small"
            />
          )}
          Resend
        </button>
      ) : (
        <Tooltip title="Only available when accepted" placement="top">
          <p className="new text-center">N/A</p>
        </Tooltip>
      )}
    </>
  )
}
