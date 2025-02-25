import User from '../../resources/user.svg'
import * as React from 'react'
import { useState } from 'react'
import { StatefulTooltip } from 'baseui/tooltip'
import { CustomSpinner } from './Spinner'
import { Block } from 'baseui/block'
import { env } from '../../util/env'

export const resourceImageLink = (navIdent: string, forceUpdate = false) => `${env.teamCatalogBaseUrl}/resource/${navIdent}/photo` + (forceUpdate ? '?forceUpdate=true' : '')

export const UserImage = (props: { ident: string; size: string; disableRefresh?: boolean; border?: boolean }) => {
  const { size, ident, disableRefresh } = props
  const [image, setImage] = React.useState(resourceImageLink(props.ident))
  const [loading, setLoading] = useState(true)

  const loadingSpinner = loading && (
    <Block width={size} height={size}>
      <CustomSpinner size="100%" />
    </Block>
  )
  const imageTag = (
    <img
      src={image}
      onError={() => {
        setImage(User)
        setLoading(false)
      }}
      onLoad={() => setLoading(false)}
      onClick={() => {
        if (props.disableRefresh) {
          return
        }
        setImage(resourceImageLink(ident, true))
        setLoading(true)
      }}
      alt={`Profilbilde ${ident}`}
      style={{
        width: loading ? 0 : size,
        height: loading ? 0 : size,
        borderRadius: '100%',
        boxShadow: props.border ? '0 0 2px 2px black inset, 0 0 2px 2px black' : undefined,
      }}
    />
  )

  if (disableRefresh) {
    return (
      <>
        {loadingSpinner}
        {imageTag}
      </>
    )
  }

  return (
    <>
      {loadingSpinner}
      <StatefulTooltip content={'Bildet hentes fra outlook/navet. Trykk på bildet for å hente på ny.'}>{imageTag}</StatefulTooltip>
    </>
  )
}
