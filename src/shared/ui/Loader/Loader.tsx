'use client'

import { LoadingOutlined } from '@ant-design/icons'
import { Spin, type SpinProps } from 'antd'
import classNames from 'classnames'

import styles from './Loader.module.css'

export type LoaderProps = SpinProps

export function Loader({
  indicator = <LoadingOutlined spin />,
  classNames: spinClassNames,
  ...props
}: LoaderProps) {
  const mergedClassNames: SpinProps['classNames'] = (info) => {
    const resolvedClassNames =
      typeof spinClassNames === 'function' ? spinClassNames(info) : spinClassNames

    return {
      ...resolvedClassNames,
      description: classNames(styles.description, resolvedClassNames?.description)
    }
  }

  return <Spin {...props} indicator={indicator} classNames={mergedClassNames} />
}
