import { Spin, Tooltip } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import axios from "axios"
import { useState } from "react"
import toast from "react-hot-toast"

export default function CancelIO({ data, routeName }) {

    const [loading, setLoading] = useState(false)
    const dataArray = data.split(",")
    const [status, setStatus] = useState(dataArray[0])
    const ioNo = dataArray[1]

    const resendIoDocument = () => {
        setLoading(true)
        axios
            .post(route(routeName, { ioNo, type: 'cancel' }))
            .then((response) => {
                if (response.data.success === true) {
                    setStatus('canceled')
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
            {status === 'accepted' ?
                <button
                    className={`resend ${loading ? 'resend-disabled' : ''}`}
                    onClick={resendIoDocument}
                    style={{ backgroundColor: '#ff0e0e' }}
                >{loading &&
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 15, color: '#fff' }} />} size="small" />
                    }
                    Cancel
                </button>
                : status === 'canceled' ? <p style={{ textAlign: 'center', lineHeight: 1.5 }}>canceled</p> : <Tooltip title="Only available when accepted" placement="top">
                    <p style={{ textAlign: 'center' }}>N/A</p>
                </Tooltip>
            }
        </>
    )

}
