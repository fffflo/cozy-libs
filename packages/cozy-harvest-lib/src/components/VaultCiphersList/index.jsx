import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import { withVaultClient, CipherType } from 'cozy-keys-lib'
import Text, { Title, Caption } from 'cozy-ui/transpiled/react/Text'
import Icon from 'cozy-ui/transpiled/react/Icon'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import withLocales from '../hoc/withLocales'
import CipherIcon from './CipherIcon'

class VaultCiphersList extends React.Component {
  state = {
    loading: false,
    ciphers: []
  }

  componentDidMount() {
    this.loadCiphers()
  }

  async loadCiphers() {
    this.setState({ loading: true })
    const { vaultClient, konnector } = this.props
    const konnectorURI = get(konnector, 'vendor_link')

    try {
      await vaultClient.sync()
      const ciphers = await vaultClient.getAllDecrypted({
        type: CipherType.Login,
        uri: konnectorURI
      })
      this.setState({
        ciphers
      })
    } catch (error) {
      //TODO: do something
      console.warn(error)
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    // TODO handle loading
    const { t, konnector } = this.props
    const { ciphers } = this.state

    return (
      <div>
        <Title>
          {t('Depuis quel compte souhaitez-vous importer vos données ?')}
        </Title>
        <List>
          {ciphers.map((cipherView, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <CipherIcon konnector={konnector} />
              </ListItemIcon>
              <ListItemText
                // TODO what do we show if there is no URI ?
                primaryText={get(cipherView, 'login.uris[0]._domain')}
                secondaryText={get(cipherView, 'login.username')}
              />
            </ListItem>
          ))}

          <ListItem>
            <ListItemText primaryText={t('Depuis un autre compte…')} />
          </ListItem>
        </List>
      </div>
    )
  }
}

export default withLocales(withVaultClient(VaultCiphersList))