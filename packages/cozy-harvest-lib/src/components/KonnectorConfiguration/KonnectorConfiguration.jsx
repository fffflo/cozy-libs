import React from 'react'
import PropTypes from 'prop-types'

import {
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel
} from 'cozy-ui/transpiled/react/Tabs'
import Icon from 'cozy-ui/transpiled/react/Icon'
import Card from 'cozy-ui/transpiled/react/Card'
import { SubTitle, Text, Caption } from 'cozy-ui/transpiled/react/Text'
import Button from 'cozy-ui/transpiled/react/Button'
import Modal, { ModalHeader, ModalContent } from 'cozy-ui/transpiled/react/Modal'
import palette from 'cozy-ui/transpiled/react/palette'

import TriggerErrorInfo from '../infos/TriggerErrorInfo'
import TriggerManager from '../TriggerManager'
import LaunchTriggerCard from '../cards/LaunchTriggerCard'
import DeleteAccountButton from '../DeleteAccountButton'
import withLocales from '../hoc/withLocales'
import * as triggersModel from '../../helpers/triggers'

class KonnectorConfiguration extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isJobRunning: false,
      konnectorJobError: triggersModel.getError(props.trigger),
      isShowingLoginConfiguration: false
    }

    this.handleKonnectorJobError = this.handleKonnectorJobError.bind(this)
    this.handleKonnectorJobSuccess = this.handleKonnectorJobSuccess.bind(this)
    this.handleTriggerLaunch = this.handleTriggerLaunch.bind(this)
    this.toggleLoginConfiguration = this.toggleLoginConfiguration.bind(this)
  }

  componentDidUpdate(prevProps) {
    const newKonnectorJobError = triggersModel.getError(this.props.trigger)
    const currentKonnectorJobError = this.state.konnectorJobError

    if (
      prevProps.trigger !== this.props.trigger &&
      newKonnectorJobError !== currentKonnectorJobError
    ) {
      this.setState({
        konnectorJobError: newKonnectorJobError
      })
    }
  }

  handleTriggerLaunch() {
    this.setState({ isJobRunning: true, konnectorJobError: null })
  }

  handleKonnectorJobSuccess() {
    this.setState({ isJobRunning: false })
    this.props.refetchTrigger()
  }

  handleKonnectorJobError(konnectorJobError) {
    this.setState({
      konnectorJobError,
      isJobRunning: false
    })

    this.props.refetchTrigger()
  }

  toggleLoginConfiguration (display) {
    this.setState({
      isShowingLoginConfiguration: display
    })
  }

  render() {
    const {
      konnector,
      trigger,
      account,
      onAccountDeleted,
      addAccount,
      t
    } = this.props
    const { isJobRunning, konnectorJobError, isShowingLoginConfiguration } = this.state

    const shouldDisplayError = !isJobRunning && konnectorJobError
    const hasLoginError = konnectorJobError && konnectorJobError.isLoginError()
    const hasErrorExceptLogin = konnectorJobError && !hasLoginError

    if (isShowingLoginConfiguration) {
      return (
        <Modal dismissAction={() => this.toggleLoginConfiguration(false)}>
          <ModalHeader>
            Yo
          </ModalHeader>
          <ModalContent>
            <TriggerManager
              account={account}
              konnector={konnector}
              trigger={trigger}
              onLaunch={this.handleTriggerLaunch}
              onSuccess={this.handleKonnectorJobSuccess}
              onError={this.handleKonnectorJobError}
              running={isJobRunning}
              showError={false}
            />
          </ModalContent>
        </Modal>
      )
    }

    return (
      <Tabs initialActiveTab={true ? 'configuration' : 'data'}>
        <TabList>
          <Tab name="data">
            {t('modal.tabs.data')}
            {hasErrorExceptLogin && (
              <Icon icon="warning" size={13} className="u-ml-half" />
            )}
          </Tab>
          <Tab name="configuration">
            {t('modal.tabs.configuration')}
            {hasLoginError && (
              <Icon icon="warning" size={13} className="u-ml-half" />
            )}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel name="data" className="u-pt-1-half u-pb-0">
            {shouldDisplayError && hasErrorExceptLogin && (
              <TriggerErrorInfo
                className="u-mb-2"
                error={konnectorJobError}
                konnector={konnector}
              />
            )}
            <LaunchTriggerCard
              trigger={trigger}
              onLaunch={this.handleTriggerLaunch}
              onSuccess={this.handleKonnectorJobSuccess}
              onError={this.handleKonnectorJobError}
              submitting={isJobRunning}
            />
          </TabPanel>
          <TabPanel name="configuration" className="u-pt-1-half u-pb-0">
            {shouldDisplayError && hasLoginError && (
              <TriggerErrorInfo
                className="u-mb-2"
                error={konnectorJobError}
                konnector={konnector}
              />
            )}
            <div className="u-mb-1">
              <SubTitle className="u-mb-half">
                {t('modal.updateAccount.title')}
              </SubTitle>
              <Card className="u-flex u-flex-items-center" onClick={this.toggleLoginConfiguration}>
                <div className="u-w-2 u-mr-1">
                  <Icon icon="lock" color={palette['coolGrey']} size={36} />
                </div>
                <div className="u-flex-grow-1">
                  ameli.fr
                  <Caption>26876287678</Caption>
                </div>
                <Icon icon="right" color={palette['coolGrey']} />
              </Card>
            </div>
            <div>
              <DeleteAccountButton
                account={account}
                disabled={isJobRunning}
                onSuccess={onAccountDeleted}
              />
              <Button
                onClick={addAccount}
                label={t('modal.addAccount.button')}
                theme="ghost"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    )
  }
}

KonnectorConfiguration.propTypes = {
  konnector: PropTypes.object.isRequired,
  konnectorJobError: PropTypes.object,
  trigger: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  onAccountDeleted: PropTypes.func.isRequired,
  addAccount: PropTypes.func.isRequired,
  refetchTrigger: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

export default withLocales(KonnectorConfiguration)
