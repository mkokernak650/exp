import { Card as AntCard } from 'antd'

export default function Card({ children }) {
    return (
        <AntCard
            style={{ width: 500, margin: 'auto', marginTop: '2rem' }}
            styles={{ body: { padding: 40 } }}
        >
            {children}
        </AntCard>
    )
}
