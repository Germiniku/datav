import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, ModalFooter, Button, Input, useToast, FormControl, FormLabel } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import React, { useCallback, useState } from 'react'
import { commonMsg, newMsg } from 'src/i18n/locales/en'
import { Panel } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'
import { usePanelSave } from './usePanelSave'

export default function LibraryPanel({
  isOpen,
  onClose,
  panel
}: {
  isOpen: boolean
  onClose: () => void
  panel: Panel
}) {
  const [panelName, setPanelName] = useState(panel.title);

  const t = useStore(commonMsg)
  const t1 = useStore(newMsg)
  const toast = useToast()

  const { saveLibraryPanel } = usePanelSave()
  const onCreate = useCallback(() => {
    panel.libraryPanel = { uid: '', name: panelName }
    saveLibraryPanel(panel).then(([panel, savedPanel]) => {
      toast({
        title: t1.libraryPanelToast,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    })
  }, [])
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t.createLibraryPanel}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Library Panel Name</FormLabel>
            <Input value={panelName} onChange={(e) => setPanelName(e.currentTarget.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button size={"md"} mr={3} onClick={() => onClose()}>{t.cancel}</Button>
          <Button size={"md"} onClick={onCreate}>{t.submit}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}