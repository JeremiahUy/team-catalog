import React, { useEffect } from "react"
import { ProductTeam, ResourceType, TeamType } from '../../constants'
import { getAllTeams } from '../../api/teamApi'
import { useTable } from '../../util/hooks'
import { Cell, HeadCell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import { getAllProductAreas } from '../../api'
import { RouteComponentProps, withRouter } from "react-router-dom"

export enum TeamSize {
  EMPTY = '0_1',
  UP_TO_5 = '1_6',
  UP_TO_10 = '6_11',
  UP_TO_20 = '11_21',
  OVER_20 = '21_1000'
}

export enum TeamExt {
  UP_TO_25p = '0_26',
  UP_TO_50p = '26_51',
  UP_TO_75p = '51_76',
  UP_TO_100p = '76_101'
}

export const TeamListImpl = (props: { teamType?: TeamType, teamSize?: TeamSize, teamExt?: TeamExt } & RouteComponentProps) => {
  const {teamSize, teamType, teamExt} = props
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [paList, setPaList] = React.useState<Record<string, string>>({})
  const [filtered, setFiltered] = React.useState<ProductTeam[]>([])
  const productAreaId = new URLSearchParams(props.history.location.search).get('productAreaId')

  const [table, sortColumn] = useTable<ProductTeam, keyof ProductTeam>(filtered, {
      useDefaultStringCompare: true,
      initialSortColumn: 'name',
      sorting: {
        members: (a, b) => b.members.length - a.members.length,
        productAreaId: (a, b) => (paList[a.productAreaId] || '').localeCompare(paList[b.productAreaId] || '')
      }
    }
  )
  const filter = (list: ProductTeam[]) => {
    if (productAreaId) {
      list = list.filter(t => t.productAreaId === productAreaId)
    }
    if (teamType) {
      list = list.filter(t => t.teamType === teamType)
    }
    if (teamSize) {
      const from = parseInt(teamSize.substr(0, teamSize.indexOf('_')))
      const to = parseInt(teamSize.substr(teamSize.indexOf('_') + 1))
      list = list.filter(t => t.members.length >= from && t.members.length < to)
    }
    if (teamExt) {
      const from = parseInt(teamExt.substr(0, teamExt.indexOf('_')))
      const to = parseInt(teamExt.substr(teamExt.indexOf('_') + 1))
      list = list.filter(t => {
        const ext = t.members.filter(m => m.resourceType === ResourceType.EXTERNAL).length
        const extP = t.members.length === 0 ? 0 : ext * 100 / t.members.length
        return extP >= from && extP < to
      })
    }
    return list
  }

  useEffect(() => {
    (async () => {
      setTeamList((await getAllTeams()).content)
      const pas: Record<string, string> = {};
      (await getAllProductAreas()).content.forEach(pa => pas[pa.id] = pa.name)
      setPaList(pas)
    })()
  }, [])

  useEffect(() => setFiltered(filter(teamList)), [teamList, teamSize, teamType])

  return (
    <>
      <HeadingLarge>Teams ({table.data.length})</HeadingLarge>
      <Table emptyText={'teams'} headers={
        <>
          <HeadCell title='Navn' column='name' tableState={[table, sortColumn]}/>
          <HeadCell title='Område' column='productAreaId' tableState={[table, sortColumn]}/>
          <HeadCell title='Type' column='teamType' tableState={[table, sortColumn]}/>
          <HeadCell title='Medlemmer' column='members' tableState={[table, sortColumn]}/>
        </>
      }>
        {table.data.map(team =>
          <Row key={team.id}>
            <Cell><RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink></Cell>
            <Cell><RouteLink href={`/productarea/${team.productAreaId}`}>{paList[team.productAreaId]}</RouteLink></Cell>
            <Cell>{intl[team.teamType]}</Cell>
            <Cell>{team.members.length}</Cell>
          </Row>)}
      </Table>
    </>
  )
}

export const TeamList = withRouter(TeamListImpl)
