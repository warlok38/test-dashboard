'use client'

import { ReloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'

export function ReloadPageButton() {
  return (
    <Button type="primary" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
      Перезагрузить страницу
    </Button>
  )
}
