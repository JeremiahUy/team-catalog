import { Process } from '../../constants'
import { Block } from 'baseui/block'
import { Label1 } from 'baseui/typography'
import { theme } from '../../util'
import { StyledLink } from 'baseui/link'
import { StatefulTooltip } from 'baseui/tooltip'
import * as React from 'react'
import { ObjectType } from '../admin/audit/AuditTypes'
import { intl } from '../../util/intl/intl'


export const ProcessList = (props: { parentType: ObjectType.Team | ObjectType.ProductArea, processes: Process[] }) => {
  const {parentType, processes} = props

  if (!processes.length) {
    return null
  }

  return (
    <Block width='100%'>
      <Label1 marginBottom={theme.sizing.scale600}>Behandlinger registrert på {intl[parentType]} i Behandlingskatalogen ({processes.length})</Label1>
      {processes.map(p =>
        <Block key={p.id} marginBottom={theme.sizing.scale200}>
          <StyledLink href={`https://behandlingskatalog.nais.adeo.no/process/${p.id}`} target="_blank" rel="noopener noreferrer">
            <StatefulTooltip content={p.purposeDescription}>
              {p.purposeName + ': ' + p.name}
            </StatefulTooltip>
          </StyledLink>
        </Block>
      )}
    </Block>
  )
}
