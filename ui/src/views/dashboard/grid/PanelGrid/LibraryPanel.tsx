import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, ModalFooter, Button, Input, useToast, FormControl, FormLabel } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import FormItem from 'components/form/Item'
import React, { useState } from 'react'
import { commonMsg, newMsg } from 'src/i18n/locales/en'
import { Panel } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'

export default function LibraryPanel({
    isOpen,
    onClose,
    panel
}: {
    isOpen: boolean
    onClose: () => void
    panel: Panel
}) {
    const t = useStore(commonMsg)
    const t1 = useStore(newMsg)
    const [name, setName] = useState('')
    const toast = useToast()

    const addLibraryPanel = async () => {        
        const res = await requestApi.post('/library-elements', {
            name,
            type: panel.type,
            model: panel,
        })
        toast({
            title: t1.libraryPanelToast,
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setTimeout(() => {
            onClose()
        }, 1000)
    }
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t.createLibraryPanel}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Library Panel Name</FormLabel>
                        <Input value={name} onChange={(e) => setName(e.currentTarget.value)} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button size={"md"} mr={3} onClick={() => onClose()}>{t.cancel}</Button>
                    <Button size={"md"} onClick={addLibraryPanel}>{t.submit}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}