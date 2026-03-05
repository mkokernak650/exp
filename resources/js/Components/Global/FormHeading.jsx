import { Typography } from 'antd'

const { Title } = Typography;

export default function FormHeading({ title }) {
    return (
        <Title level={4} className="text-center" style={{ marginBottom: '35px' }}>
            {title}
        </Title>
    )
}
