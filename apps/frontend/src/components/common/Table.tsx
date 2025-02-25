import { SORT_DIRECTION, SortableHeadCell, StyledBody, StyledCell, StyledHead, StyledHeadCell, StyledRow, StyledTable } from 'baseui/table'
import * as React from 'react'
import { ReactNode, useContext, useState } from 'react'
import { withStyle } from 'baseui'
import { StyleObject } from 'styletron-standard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faFilter, faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import { LabelMedium } from 'baseui/typography'
import { TableConfig, TableState, useTable } from '../../util/hooks'
import { theme } from '../../util'
import { paddingAll } from '../Style'
import { intl } from '../../util/intl/intl'
import { StatefulSelect } from 'baseui/select'
import { Modal, ModalBody, ModalHeader } from 'baseui/modal'
import { Input } from 'baseui/input'
import * as _ from 'lodash'
import { PLACEMENT, StatefulPopover } from 'baseui/popover'
import { StatefulMenu } from 'baseui/menu'
import Button from './Button'
import { KIND } from 'baseui/button'
import { Pagination } from 'baseui/pagination'

// Use this for entire app, or recreate maybe, added here as I needed it for audit

type TableProps<T, K extends keyof T> = {
  data: T[]
  config?: TableConfig<T, K>
  backgroundColor?: string
  width?: string
  hoverColor?: string
  emptyText: string
  headers: HeadProps<T, K>[]
  render: (state: TableState<T, K>) => ReactNode
  tableState?: TableState<T, K>
}

type HeadProps<T, K extends keyof T> = {
  title?: string
  column?: K
  $style?: StyleObject
  small?: boolean
}

type RowProps = {
  inactiveRow?: boolean
  selectedRow?: boolean
  infoRow?: boolean
  children?: any
  $style?: StyleObject
}

const headerCellOverride = {
  HeadCell: {
    style: {
      borderLeftWidth: '0',
      borderRightWidth: '0',
      borderTopWidth: '0',
      borderBottomWidth: '0',
    },
  },
}

const StyledHeader = withStyle(StyledHead, {
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: `2px solid ${theme.colors.mono600}`,
  marginBottom: '.5rem',
})

const tableStyle = {
  overflow: 'hidden !important',
  borderLeftWidth: '0',
  borderRightWidth: '0',
  borderTopWidth: '0',
  borderBottomWidth: '0',
  borderTopLeftRadius: '0',
  borderTopRightRadius: '0',
  borderBottomLeftRadius: '0',
  borderBottomRightRadius: '0',
  width: 'auto',
  ...paddingAll(theme.sizing.scale600),
}

type TableContextType<T, K extends keyof T> = TableProps<T, K> & { tableState: TableState<T, K> }
const createTableContext = _.once(<T, K extends keyof T>() => React.createContext<TableContextType<T, K>>({} as TableContextType<T, K>))
const useTableContext = <T, K extends keyof T>() => useContext(createTableContext<T, K>())

export const Table = <T, K extends keyof T>(props: TableProps<T, K>) => {
  const table = useTable<T, K>(props.data, props.config)
  const TableContext = createTableContext<T, K>()

  const StyleTable = withStyle(StyledTable, { ...tableStyle, backgroundColor: props.backgroundColor, width: props.width || tableStyle.width })
  return (
    <TableContext.Provider value={{ ...props, tableState: table }}>
      <StyleTable>
        <StyledHeader>
          {props.headers.map((h: any, i) => (
            <HeadCell key={i} {...h} />
          ))}
        </StyledHeader>
        <StyledBody>
          {props.render(table)}
          {!props.data.length && (
            <LabelMedium margin="1rem">
              {intl.emptyTable} {props.emptyText}
            </LabelMedium>
          )}
        </StyledBody>
      </StyleTable>

      {!!props.config?.pageSizes && (
        <Block display="flex" justifyContent="space-between" marginTop="1rem" alignItems="center">
          <StatefulPopover
            content={({ close }) => (
              <StatefulMenu
                items={props.config!.pageSizes!.map((i) => ({ label: i }))}
                onItemSelect={({ item }) => {
                  table.setLimit(item.label)
                  close()
                }}
                overrides={{
                  List: {
                    style: { height: '150px', width: '100px' },
                  },
                }}
              />
            )}
            placement={PLACEMENT.bottom}
          >
            <Block>
              <Button kind={KIND.tertiary} iconEnd={faChevronDown}>{`${table.limit} ${intl.rows}`}</Button>
            </Block>
          </StatefulPopover>
          <Block>
            <LabelMedium>Rader: {table.data.length}</LabelMedium>
          </Block>
          <Pagination
            currentPage={table.page}
            numPages={table.numPages}
            onPageChange={({ nextPage }) => table.setPage(nextPage)}
            labels={{ nextButton: intl.nextButton, preposition: 'av', prevButton: intl.prevButton }}
          />
        </Block>
      )}
    </TableContext.Provider>
  )
}

export const Row = (props: RowProps) => {
  const tableProps = useTableContext()
  const styleProps: StyleObject = {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: theme.colors.mono600,
    opacity: props.inactiveRow ? '.5' : undefined,
    backgroundColor: props.infoRow ? theme.colors.primary50 : undefined,
    borderLeftColor: theme.colors.primary200,
    borderLeftWidth: props.infoRow || props.selectedRow ? theme.sizing.scale300 : '0',
    borderLeftStyle: 'solid',
    ':hover': {
      backgroundColor: tableProps.hoverColor || (props.infoRow ? theme.colors.mono100 : theme.colors.primary50),
    },
    ...props.$style,
  }
  const StyleRow = withStyle(StyledRow, styleProps)
  return <StyleRow>{props.children}</StyleRow>
}

const SortDirectionIcon = (props: { direction: SORT_DIRECTION | null }) => {
  switch (props?.direction) {
    case SORT_DIRECTION.ASC:
      return <FontAwesomeIcon icon={faSortDown} />
    case SORT_DIRECTION.DESC:
      return <FontAwesomeIcon icon={faSortUp} />
    default:
      return <FontAwesomeIcon icon={faSort} />
  }
}

const PlainHeadCell = withStyle(StyledHeadCell, headerCellOverride.HeadCell.style)

const HeadCell = <T, K extends keyof T>(props: HeadProps<T, K>) => {
  const { title, column, small } = props
  const tableProps = useTableContext<T, K>()
  const { direction, sort, data } = tableProps.tableState || {}

  const { filterValues, setFilter } = tableProps.tableState
  const [showFilter, setShowFilter] = useState(false)
  const [inputFilter, setInputFilter] = useState((filterValues as any)[column] || '')

  const widthStyle = small ? { maxWidth: '15%' } : {}
  const styleOverride = { ...widthStyle, ...props.$style }

  if (!direction || !sort || !column || !data) {
    return <PlainHeadCell style={styleOverride}>{title}</PlainHeadCell>
  }
  const filterConf = tableProps.config?.filter ? tableProps.config.filter[column] : undefined
  const filterButton = filterConf && (
    <span
      onClick={(e) => {
        setShowFilter(true)
        e.stopPropagation()
      }}
      style={{ marginLeft: 'auto', justifySelf: 'flex-end' }}
    >
      <FontAwesomeIcon size="sm" icon={faFilter} color={!!inputFilter ? theme.colors.negative400 : theme.colors.primary200} />
    </span>
  )

  const filterBody = () => {
    if (!filterConf) return null
    if (filterConf.type === 'search' || filterConf.type === 'searchMapped') {
      return (
        <Input
          value={inputFilter}
          onChange={(e) => setInputFilter(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setFilter(column, inputFilter)
            }
          }}
        />
      )
    }
    if (filterConf.type === 'select') {
      const options =
        (filterConf.options && filterConf.options(data)) ||
        _.uniqBy(
          data
            .map(filterConf.mapping)
            .flatMap((o) => (Array.isArray(o) ? o : [o]))
            .filter((o) => !!o.id),
          (o) => o.id
        )
      return (
        <StatefulSelect
          onChange={(params) => setFilter(column, params.option?.id as string)}
          initialState={{ value: !inputFilter ? [] : [{ id: inputFilter, label: inputFilter }] }}
          options={options}
          startOpen={true}
          maxDropdownHeight="400px"
        />
      )
    }
  }

  return (
    <>
      <SortableHeadCell
        overrides={{
          SortableLabel: {
            component: () => (
              <Block width="100%" display="flex">
                <SortDirectionIcon direction={direction[column]} />
                <Block marginRight={theme.sizing.scale200} display="inline" />
                {title}
                {filterButton}
              </Block>
            ),
          },
          HeadCell: { style: { ...headerCellOverride.HeadCell.style, ...styleOverride } },
        }}
        title={title || ''}
        direction={direction[column]}
        onSort={() => sort(column)}
        fillClickTarget
      />
      {filterConf && (
        <Modal isOpen={showFilter} onClose={() => setShowFilter(false)}>
          <ModalHeader>Filter {title}</ModalHeader>
          <ModalBody>{filterBody()}</ModalBody>
        </Modal>
      )}
    </>
  )
}

export const Cell = (props: { small?: boolean; $style?: StyleObject; children?: ReactNode }) => {
  const widthStyle = props.small ? { maxWidth: '15%' } : {}
  return <StyledCell style={{ ...props.$style, ...widthStyle }}>{props.children}</StyledCell>
}
