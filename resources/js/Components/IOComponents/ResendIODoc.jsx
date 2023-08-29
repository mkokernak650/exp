import { CircularProgress, Tooltip } from "@material-ui/core"
import { useState } from "react"

export default function ResendIODoc({ data }) {
    const [loading, setLoading] = useState(false)
    const dataArray = data.split(",")
    const status = dataArray[0]
    // console.log(data)
    const resendIoDocument = () => {
        // axios
        //     .post(route('', { billingDetails, orderDetails, subTotal }))
        //     .then((response) => {
        //         if (response.data.success === true) {
        //             toast.success(response.data.msg)
        //         } else {
        //             toast.error(response.data.msg)
        //         }
        //     })
        //     .catch((err) => {
        //         toast.error('Something went wrong!')
        //     })
        setLoading(true)
        console.log(dataArray)
        console.log(status)
    }

    return (
        <>
            {status === 'accepted' ?
                <button
                    className={`resend ${loading ? 'resend-disabled' : ''}`}
                    onClick={resendIoDocument}
                >{loading &&
                    <CircularProgress size={15} />
                    }
                    Resend
                </button>
                : <Tooltip title="Only available when accepted" placement="top">
                    <p className="new" style={{ textAlign: 'center' }}>N/A</p>
                </Tooltip>
            }
        </>
    )
}