import { Box, TableContainer, Table, Th, Thead, Tr, Tbody, Td, Button } from '@chakra-ui/react'
import Loading from 'components/loading/Loading'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { commonMsg } from 'src/i18n/locales/en'
import { LibraryPanel } from 'types/libraryPanel'
import { requestApi } from 'utils/axios/request'
import { useStore } from "@nanostores/react"

export default function () {
    const t = useStore(commonMsg)
    const [panels, setPanels] = useState<LibraryPanel[]>([])
    useEffect(() => {
        load()
    }, [])
    const load = async () => {
        const res = await requestApi.get(`/library-elements`)
        setPanels(res.data)
    }

    return (
        <>
            <Box>
                {panels ? <TableContainer>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>name</Th>
                                <Th>description</Th>
                                <Th>type</Th>
                                <Th>created</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                panels?.map(panel => <Tr key={panel.id}>
                                    <Td>{panel.name}</Td>
                                    <Td>{panel.description}</Td>
                                    <Td>{panel.type}</Td>
                                    <Td>{moment(panel.created).fromNow()}</Td>
                                    <Td>
                                        <Button variant="ghost" size="sm" px="0">{t.manage}</Button>
                                    </Td>
                                </Tr>)
                            }
                        </Tbody>
                    </Table>
                </TableContainer> : <Loading style={{ marginTop: '50px' }} />}
            </Box>
        </>
    )
}