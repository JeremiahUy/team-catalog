import * as React from 'react'
import {useEffect} from 'react'
import Metadata from '../components/common/Metadata'
import ListMembers from '../components/Team/ListMembers'
import {Member, ProductArea, ProductTeam, ProductTeamFormValues} from '../constants'
import {editTeam, getTeam, mapProductTeamToFormValue} from '../api/teamApi'
import {H4, Label1, Paragraph2} from 'baseui/typography'
import {Block, BlockProps} from 'baseui/block'
import {RouteComponentProps} from 'react-router-dom'
import {theme} from '../util'
import {getAllProductAreas, getProductArea} from "../api";
import ModalTeam from "../components/Team/ModalTeam";
import {Option} from "baseui/select";
import {Button, SIZE as ButtonSize} from 'baseui/button';

export type PathParams = { id: string }


const blockProps: BlockProps = {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
}

const TeamPage = (props: RouteComponentProps<PathParams>) => {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [team, setTeam] = React.useState<ProductTeam>()
  const [productAreaName, setProductAreaName] = React.useState<string>('')
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false)
  const [productAreas, setProductAreas] = React.useState<Option[]>([])
  const [initialProductTeamFormValue, setInitialProductTeamFormValue] = React.useState<ProductTeamFormValues>();
  const [errorMessage, setErrorMessage] = React.useState<String>();

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const editResponse = await editTeam(values)
    if (editResponse.id) {
      setTeam(editResponse)
      assignProductAreaName(editResponse.productAreaId)
      setShowEditModal(false)
      setErrorMessage("")
    } else {
      setErrorMessage(editResponse.response.data.message)
    }
  }

  const mapProductAreaToOptions = (list: ProductArea[]) => {
    return list.map(po => ({id: po.id, label: po.name}))
  }

  const handleOpenModal = async () => {
    const res = await getAllProductAreas()
    if (res.content) {
      setProductAreas(mapProductAreaToOptions(res.content))
      setShowEditModal(true)
    }
  }

  const assignProductAreaName = async (productAreaId: string) => {
    if (productAreaId) {
      const productAreaResponse = await getProductArea(productAreaId)
      setProductAreaName(productAreaResponse.name)
    } else {
      setProductAreaName("Ingen produktområde registrert")
    }
  }

  const getTeamValues = async () => {
    setLoading(true)
    const teamResponse = await getTeam(props.match.params.id)
    setInitialProductTeamFormValue(mapProductTeamToFormValue(teamResponse));
    console.log(teamResponse, "TEAM RESPONSE")
    assignProductAreaName(teamResponse.productAreaId)
    setTeam(teamResponse)
    setLoading(false)
  }

  const sortedMemberList = (list: Member[]) => {
    let teamLeader = list.filter((member: Member) => member.navIdent === team?.teamLeader)
    let filteredAndSortedList = list.filter((member: Member) => member.navIdent !== team?.teamLeader).sort((a, b) => a.name.localeCompare(b.name))
    return [...teamLeader, ...filteredAndSortedList]
  }

  useEffect(() => {
    if (props.match.params.id || !showEditModal) {
      getTeamValues()
    }
    (async () => {
      if (props.match.params.id) {
        setLoading(true)
        const teamResponse = await getTeam(props.match.params.id)
        console.log(teamResponse, "TEAM RESPONSE")
        if (teamResponse.productAreaId) {
          const productAreaResponse = await getProductArea(teamResponse.productAreaId)
          setProductAreaName(productAreaResponse.name)
        } else {
          setProductAreaName("Ingen produktområde registrert")
        }
        setTeam(teamResponse)
        setLoading(false)
      }
    })()
  }, [props.match.params])

  return (
    <>
      {!loading && team && (
        <>
          <Block {...blockProps}>
            <Block>
              <H4>{team.name}</H4>
            </Block>
            <Button
              size={ButtonSize.compact}
              onClick={() => handleOpenModal()}
            >
              Rediger
            </Button>
          </Block>
          <Block>
            <Metadata
              productAreaName={productAreaName}
              description={team.description}
              slackChannel={team.slackChannel}
              naisTeams={team.naisTeams}
              teamLeadQA={team?.teamLeadQA}
              teamType={team?.teamType}
            />
          </Block>
          <Block marginTop="3rem">
            <Label1 marginBottom={theme.sizing.scale800}>Medlemmer av teamet</Label1>
            {team.members.length > 0 ? <ListMembers members={sortedMemberList(team.members)}/> : <Paragraph2>Ingen medlemmer registrert'</Paragraph2>}
          </Block>

          <ModalTeam
            title={"Rediger team"}
            isOpen={showEditModal}
            initialValues={mapProductTeamToFormValue(team)}
            productAreaOptions={productAreas}
            errorMessage={errorMessage}
            submit={handleSubmit}
            onClose={() => {
              setShowEditModal(false)
              setErrorMessage("")
            }}/>
        </>
      )}
    </>
  )
}

export default TeamPage
