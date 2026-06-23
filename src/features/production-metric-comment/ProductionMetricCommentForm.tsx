'use client'

import { Button, Form, Input, message } from 'antd'

import { useAddProductionMetricCommentMutation } from '@/entities/production-stage'

import styles from './ProductionMetricCommentForm.module.css'

type ProductionMetricCommentFormValues = {
  author: string
  text: string
}

type ProductionMetricCommentFormProps = {
  stageSlug: string
  metricSlug: string
}

const DEFAULT_AUTHOR = 'Оператор'

export function ProductionMetricCommentForm({
  stageSlug,
  metricSlug
}: ProductionMetricCommentFormProps) {
  const [form] = Form.useForm<ProductionMetricCommentFormValues>()
  const [addComment, { isLoading }] = useAddProductionMetricCommentMutation()
  const [messageApi, contextHolder] = message.useMessage()

  const handleFinish = async (values: ProductionMetricCommentFormValues) => {
    try {
      await addComment({
        stageSlug,
        metricSlug,
        body: {
          author: values.author.trim(),
          text: values.text.trim()
        }
      }).unwrap()

      messageApi.success('Комментарий отправлен')
      form.setFieldValue('text', '')
    } catch {
      messageApi.error('Не удалось отправить комментарий')
    }
  }

  return (
    <section className={styles.commentPanel} aria-labelledby="metric-comment-title">
      {contextHolder}
      <div className={styles.commentHeader}>
        <h2 id="metric-comment-title" className={styles.commentTitle}>
          Комментарий к показателю
        </h2>
      </div>

      <Form<ProductionMetricCommentFormValues>
        form={form}
        layout="vertical"
        initialValues={{ author: DEFAULT_AUTHOR }}
        onFinish={handleFinish}
      >
        <div className={styles.commentFields}>
          <Form.Item
            name="author"
            label="Автор"
            rules={[
              { required: true, message: 'Укажите автора' },
              { whitespace: true, message: 'Укажите автора' }
            ]}
          >
            <Input placeholder="Оператор" disabled={isLoading} />
          </Form.Item>

          <Form.Item
            name="text"
            label="Комментарий"
            rules={[
              { required: true, message: 'Введите комментарий' },
              { whitespace: true, message: 'Введите комментарий' }
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              placeholder="Опишите причину отклонения или действие по показателю"
              disabled={isLoading}
            />
          </Form.Item>
        </div>

        <div className={styles.commentActions}>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Отправить
          </Button>
        </div>
      </Form>
    </section>
  )
}
