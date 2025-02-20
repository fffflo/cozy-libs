import React, { Component } from 'react'
import PropTypes from 'prop-types'

import get from 'lodash/get'
import flow from 'lodash/flow'
import { withMutations } from 'cozy-client'
import { translate } from 'cozy-ui/transpiled/react/I18n'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Modal, {
  ModalContent,
  ModalHeader
} from 'cozy-ui/transpiled/react/Modal'
import Button from 'cozy-ui/transpiled/react/Button'
import { Text } from 'cozy-ui/transpiled/react/Text'
import { withBreakpoints } from 'cozy-ui/transpiled/react'
import palette from 'cozy-ui/transpiled/react/palette'

import accountMutations from '../connections/accounts'
import triggersMutations from '../connections/triggers'
import * as triggersModel from '../helpers/triggers'
import TriggerManager from './TriggerManager'
import { withMountPointPushHistory } from './MountPointContext'

export class EditAccountModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      trigger: null,
      account: null,
      fetching: true,
      error: false
    }
  }

  componentDidMount() {
    const { accountId, accounts } = this.props
    /**
     * @TODO In theory we can have several trigger for the same account.
     * If so this code will not work as excepted. This case is theoretical
     */

    const matchingTrigger = get(
      accounts.find(account => account.account._id === accountId),
      'trigger'
    )
    if (matchingTrigger) this.fetchAccount(matchingTrigger)
  }
  /**
   * TODO use queryConnect to know if we're fecthing or not
   */
  async fetchAccount(trigger) {
    const { findAccount } = this.props
    this.setState({ fetching: true })

    try {
      const account = await findAccount(triggersModel.getAccountId(trigger))
      this.setState({
        account,
        trigger
      })
      return account
    } catch (error) {
      this.setState({
        error
      })
    } finally {
      this.setState({
        fetching: false
      })
    }
  }

  render() {
    /**
     * We don't use the dismiss action pros that we can have from our
     * Routes component since this modal has to be on top on the previous one
     * So when we quit it, we have to go back to the previous one.
     *
     * When we are on mobile, we display a back button
     * On desktop we display a cross
     */
    const {
      konnector,
      t,
      breakpoints: { isMobile },
      pushHistory
    } = this.props
    const { trigger, account, fetching } = this.state
    return (
      <Modal
        dismissAction={() => pushHistory(`/accounts/${account._id}`)}
        mobileFullscreen
        size="small"
        closable={isMobile ? false : true}
        closeBtnColor={palette.white}
        className="u-bg-dodgerBlue"
      >
        {/** TODO Should be moved to UI when this design is stablized  */}
        <ModalHeader className="u-mb-0 u-p-0 u-h-3 u-flex u-flex-items-center">
          {isMobile && (
            <Button
              onClick={() => pushHistory(`/accounts/${account._id}`)}
              icon="previous"
              label={t('back')}
              iconOnly
              extension="narrow"
              className="u-m-0 u-p-1 u-pos-absolute u-h-3"
              style={{
                left: 0,
                top: 0
              }}
            />
          )}
          <div className="u-flex-grow-1 u-ta-center">
            <Text className="u-white">{konnector.name}</Text>
          </div>
        </ModalHeader>
        <ModalContent className="u-pt-1-half">
          {fetching ? (
            <div className="u-pv-2 u-ta-center">
              <Spinner size="xxlarge" />
            </div>
          ) : (
            <TriggerManager
              account={account}
              konnector={konnector}
              initialTrigger={trigger}
              onSuccess={() => pushHistory(`/accounts/${account._id}`)}
              showError={true}
            />
          )}
        </ModalContent>
      </Modal>
    )
  }
}

EditAccountModal.propTypes = {
  konnector: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  breakpoints: PropTypes.object.isRequired,
  accountId: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
  findAccount: PropTypes.func.isRequired,
  fetchTrigger: PropTypes.func.isRequired
}

export default flow(
  withMutations(accountMutations, triggersMutations),
  withBreakpoints(),
  translate(),
  withMountPointPushHistory
)(EditAccountModal)
