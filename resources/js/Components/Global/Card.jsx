import { Card as AntCard } from 'antd'

export default function Card({ children }) {
  return (
    <AntCard className="w-[500px] m-auto mt-8" styles={{ body: { padding: 40 } }}>
      {children}
    </AntCard>
  )
}
