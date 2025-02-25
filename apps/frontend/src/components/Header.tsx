import * as React from 'react'
import { useEffect, useState } from 'react'
import { ALIGN, HeaderNavigation, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList } from 'baseui/header-navigation'
import { Block, BlockProps } from 'baseui/block'
import { Button } from 'baseui/button'
import { StatefulPopover } from 'baseui/popover'
import { useHistory, useLocation } from 'react-router-dom'
import { user } from '../services/User'
import { StyledLink } from 'baseui/link'
import { useQueryParam } from '../util/hooks'
import { paddingAll } from './Style'
import { theme } from '../util'
import { LabelMedium } from 'baseui/typography'
import { UserImage } from './common/UserImage'
import { intl } from '../util/intl/intl'
import { StatefulMenu } from 'baseui/menu'
import { TriangleDown } from 'baseui/icon'
import MainSearch from './search/MainSearch'
import BurgerMenu from './Navigation/Burger'
import RouteLink from './common/RouteLink'
import { ampli } from '../services/Amplitude'

const HeaderNavigationFix = HeaderNavigation as any // This is to fix a typescript error that isnt an error

const LoginButton = (props: { location: string }) => {
  return (
    <StyledLink href={`/login?redirect_uri=${props.location}`}>
      <Button $style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>Logg inn</Button>
    </StyledLink>
  )
}

const LoggedInHeader = (props: { location: string }) => {
  const blockStyle: BlockProps = {
    display: 'flex',
    width: '100%',
    ...paddingAll(theme.sizing.scale100),
  }
  return (
    <StatefulPopover
      content={
        <Block padding={theme.sizing.scale400}>
          <LabelMedium {...blockStyle}>Navn: {user.getName()}</LabelMedium>
          {/* <LabelMedium {...blockStyle}>Grupper: {user.getGroupsHumanReadable().join(', ')}</LabelMedium> */}
          {user.getIdent() && (
            <Block {...blockStyle}>
              <RouteLink href={`/resource/${user.getIdent()}`}>Min side</RouteLink>
            </Block>
          )}
          <Block {...blockStyle}>
            <RouteLink href={`/user/notifications`}>Mine varsler</RouteLink>
          </Block>
          <Block {...blockStyle}>
            <StyledLink href={`/logout?redirect_uri=${props.location}`}>Logg ut</StyledLink>
          </Block>
        </Block>
      }
    >
      <Button kind="tertiary" startEnhancer={<UserImage ident={user.getIdent()} size="20px" disableRefresh />}>
        {user.getIdent()}
      </Button>
    </StatefulPopover>
  )
}

const AdminOptions = () => {
  const history = useHistory()
  const pages = [
    { label: intl.audit, href: '/admin/audit' },
    { label: intl.mailLog, href: '/admin/maillog' },
    { label: intl.settings, href: '/admin/settings' },
  ]
  return (
    <StatefulPopover
      content={({ close }) => (
        <StatefulMenu
          items={pages}
          onItemSelect={(select) => {
            select.event?.preventDefault()
            close()
            history.push(select.item.href)
          }}
        />
      )}
    >
      <Button endEnhancer={<TriangleDown />} kind="tertiary">
        {intl.administrate}
      </Button>
    </StatefulPopover>
  )
}

let sourceReported = false

const Header = () => {
  const [url, setUrl] = useState(window.location.href)
  const location = useLocation()
  const source = useQueryParam('source')
  if (source && !sourceReported) {
    sourceReported = true
    ampli.logEvent('teamkatalog_source', { source })
  }

  useEffect(() => setUrl(window.location.href), [location.pathname])

  return (
    <Block>
      <HeaderNavigationFix overrides={{ Root: { style: { paddingBottom: 0, borderBottomStyle: 'none' } } }}>
        <Block display={['block', 'block', 'none', 'none']}>
          <BurgerMenu />
        </Block>

        <NavigationList $align={ALIGN.left}>
          <NavigationItem $style={{ paddingLeft: 0 }}>
            <MainSearch />
          </NavigationItem>
        </NavigationList>

        <NavigationList $align={ALIGN.center} />

        <Block display={['none', 'none', 'flex', 'flex']}>
          <NavigationList $align={ALIGN.right}>
            {user.isAdmin() && (
              <NavigationItem $style={{ paddingLeft: 0 }}>
                <AdminOptions />
              </NavigationItem>
            )}

            {!user.isLoggedIn() && (
              <NavigationItem $style={{ paddingLeft: 0 }}>
                <LoginButton location={url} />
              </NavigationItem>
            )}
            {user.isLoggedIn() && (
              <NavigationItem $style={{ paddingLeft: 0 }}>
                <LoggedInHeader location={url} />
              </NavigationItem>
            )}
          </NavigationList>
        </Block>
      </HeaderNavigationFix>
    </Block>
  )
}

export default Header
