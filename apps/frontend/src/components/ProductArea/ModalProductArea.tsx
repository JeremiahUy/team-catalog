import * as React from 'react'
import { KeyboardEvent } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'
import { Field, FieldProps, Form, Formik, FormikProps, } from 'formik'
import { Block, BlockProps } from 'baseui/block'
import { ProductAreaFormValues } from '../../constants'
import CustomizedModalBlock from '../common/CustomizedModalBlock'
import { ModalLabel, Error } from '../common/ModalSchema'
import { Input } from 'baseui/input'
import { Textarea } from 'baseui/textarea'
import Button from '../common/Button'
import { KIND } from 'baseui/button'
import { productAreaSchema } from '../common/schema'


const modalBlockProps: BlockProps = {
    width: '700px',
    paddingRight: '2rem',
    paddingLeft: '2rem',
}

const rowBlockProps: BlockProps = {
    display: 'flex',
    width: '100%',
}

const modalHeaderProps: BlockProps = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem'
}

type ModalProductAreaProps = {
    title: string
    isOpen: boolean
    isEdit?: boolean
    initialValues: ProductAreaFormValues
    errorOnCreate: any | undefined
    submit: (process: ProductAreaFormValues) => void
    onClose: () => void
}

const ModalProductArea = ({ submit, errorOnCreate, onClose, isOpen, initialValues, title }: ModalProductAreaProps) => {
    const [description, setDescription] = React.useState('')

    const disableEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault()
    }

    return (
        <Modal
            onClose={onClose}
            isOpen={isOpen}
            closeable={false}
            animate
            size={SIZE.auto}
            role={ROLE.dialog}
        >
            <Block {...modalBlockProps}>
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => {
                        submit(values)
                    }}
                    validationSchema={productAreaSchema()}
                    render={(formikBag: FormikProps<ProductAreaFormValues>) => (
                        <Form onKeyDown={disableEnter}>
                            <ModalHeader>
                                <Block {...modalHeaderProps}>
                                    {title}
                                </Block>
                            </ModalHeader>

                            <ModalBody>
                                <CustomizedModalBlock>
                                    <Block {...rowBlockProps}>
                                        <ModalLabel label="Navn" />
                                        <Field name="name">
                                            {(props: FieldProps) =>
                                                <Input type="text" size={SIZE.default} {...props.field} />
                                            }
                                        </Field>
                                    </Block>

                                    <Error fieldName='name' />
                                </CustomizedModalBlock>

                                <CustomizedModalBlock>
                                    <Block {...rowBlockProps}>
                                        <ModalLabel label="Beskrivelse" />
                                        <Field name="description">
                                            {(props: FieldProps) =>
                                                <Textarea
                                                    value={description}
                                                    onChange={event => setDescription((event.target as HTMLTextAreaElement).value)}
                                                    {...props.field}
                                                />
                                            }
                                        </Field>
                                    </Block>
                                    <Error fieldName='description' />
                                </CustomizedModalBlock>
                            </ModalBody>

                            <ModalFooter style={{ borderTop: 0 }}>
                                <Block display='flex' justifyContent='flex-end'>
                                    <Block alignSelf='flex-end'>{errorOnCreate && <p>{errorOnCreate}</p>}</Block>
                                    <Button type='button' kind={KIND.minimal} onClick={onClose}>Avbryt</Button>
                                    <ModalButton type='submit'>Lagre</ModalButton>
                                </Block>
                            </ModalFooter>
                        </Form>
                    )}
                />

            </Block>
        </Modal>
    )
}

export default ModalProductArea
