import { SmileOutlined } from '@ant-design/icons'
import { Empty as AntEmpty, type EmptyProps as AntEmptyProps } from 'antd'

export type EmptyProps = AntEmptyProps

const emptyStyles = {
  image: {
    height: 24,
    marginBottom: 8,
    color: 'var(--ant-color-text-disabled)',
    fontSize: 20,
    lineHeight: 1
  },
  description: {
    color: 'var(--ant-color-text-disabled)',
    fontSize: 'var(--ant-font-size-lg)'
  }
} satisfies NonNullable<AntEmptyProps['styles']>

export function Empty({
  image = <SmileOutlined />,
  description = 'Данные не найдены',
  styles,
  ...props
}: EmptyProps) {
  const mergedStyles: AntEmptyProps['styles'] = (info) => {
    const resolvedStyles = typeof styles === 'function' ? styles(info) : styles

    return {
      ...resolvedStyles,
      image: {
        ...emptyStyles.image,
        ...resolvedStyles?.image
      },
      description: {
        ...emptyStyles.description,
        ...resolvedStyles?.description
      }
    }
  }

  return <AntEmpty {...props} image={image} description={description} styles={mergedStyles} />
}
