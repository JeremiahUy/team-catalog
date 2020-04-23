import * as React from 'react'
import { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { Input, SIZE } from 'baseui/input'
import { Select } from 'baseui/select'
import { ResourceOption, useResourceSearch } from '../../api/resourceApi'
import { theme } from '../../util'
import { Member } from '../../constants'
import { useDebouncedState } from '../../util/hooks'


type FieldsAddMemberProps = {
  member?: Member,
  onChangeMember: (member?: Partial<Member>) => void,
  filterMemberSearch: (o: ResourceOption[]) => ResourceOption[]
}

const isEmpty = (member: Partial<Member>) => !member.navIdent && !member.role

const memberToResource = (member: Member): ResourceOption => ({
  id: member.navIdent,
  navIdent: member.navIdent,
  name: member.name,
  label: member.navIdent ? `${member.name} (${member.navIdent})` : '',
  resourceType: member.resourceType
})

const FormEditMember = (props: FieldsAddMemberProps) => {
  const {onChangeMember, member} = props
  const [resource, setResource] = useState<ResourceOption[]>(member ? [memberToResource(member)] : [])
  const [role, setRole, roleValue] = useDebouncedState(member?.role || '', 400)

  const [searchResult, setResourceSearch, loading] = useResourceSearch()

  useEffect(() => {
    const reso = (resource.length ? resource[0] : {}) as ResourceOption
    const val: Partial<Member> = {
      navIdent: reso.id,
      name: reso.name,
      resourceType: reso.resourceType,
      role
    }
    onChangeMember(isEmpty(val) ? undefined : val)
  }, [resource, role])


  return (
    <>
      <Block display="flex" justifyContent="space-between" width="100%">
        <Block width="60%" marginRight={theme.sizing.scale400}>
          <Select
            options={!loading ? props.filterMemberSearch(searchResult) : []}
            filterOptions={options => options}
            maxDropdownHeight="400px"
            onChange={({value}) => {
              setResource(value as ResourceOption[])
            }}
            onInputChange={async event => setResourceSearch(event.currentTarget.value)}
            value={resource}
            isLoading={loading}
            placeholder="Søk etter ansatte"
          />
        </Block>
        <Block width={"40%"}>
          <Input type="text" size={SIZE.default} value={roleValue}
                 onChange={e => setRole((e.target as HTMLInputElement).value)}
                 disabled={!resource.length}
                 placeholder="Rolle *"/>
        </Block>
      </Block>
    </>
  )
}

export default FormEditMember
