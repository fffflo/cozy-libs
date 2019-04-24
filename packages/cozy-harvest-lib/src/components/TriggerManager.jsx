import React, { Component } from 'react'
import PropTypes from 'react-proptypes'

import { withMutations } from 'cozy-client'
import { translate } from 'cozy-ui/react/I18n'

import AccountForm from './AccountForm'
import TwoFAForm from './TwoFAForm'
import accountsMutations from '../connections/accounts'
import { triggersMutations } from '../connections/triggers'
import filesMutations from '../connections/files'
import permissionsMutations from '../connections/permissions'
import accounts from '../helpers/accounts'
import cron from '../helpers/cron'
import konnectors from '../helpers/konnectors'
import { slugify } from '../helpers/slug'
import triggers from '../helpers/triggers'

const ERRORED = 'ERRORED'
const IDLE = 'IDLE'
const RUNNING = 'RUNNING'
const RUNNING_TWOFA = 'RUNNING_TWOFA'

const MODAL_PLACE_ID = 'coz-harvest-modal-place'

/**
 * Manage a trigger for a given konnector, from account edition to trigger
 * creation and launch.
 * @type {Component}
 */
export class TriggerManager extends Component {
  constructor(props) {
    super(props)
    const { account, trigger } = props

    this.handleAccountSaveSuccess = this.handleAccountSaveSuccess.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.handleSuccess = this.handleSuccess.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleTwoFACodeAsked = this.handleTwoFACodeAsked.bind(this)
    this.handleSubmitTwoFACode = this.handleSubmitTwoFACode.bind(this)

    this.state = {
      account,
      error: triggers.getError(trigger),
      status: IDLE,
      trigger,
      jobWatcher: null
    }
  }

  /**
   * Ensure that a trigger will exist, with valid destination folder with
   * permissions and references
   * @return {Object} Trigger document
   */
  async ensureTrigger() {
    const {
      addPermission,
      addReferencesTo,
      createDirectoryByPath,
      createTrigger,
      statDirectoryByPath,
      konnector,
      t
    } = this.props

    const { account, trigger } = this.state

    if (trigger) {
      return trigger
    }

    let folder

    if (konnectors.needsFolder(konnector)) {
      const path = `${t('default.baseDir')}/${konnector.name}/${slugify(
        accounts.getLabel(account)
      )}`

      folder =
        (await statDirectoryByPath(path)) || (await createDirectoryByPath(path))

      await addPermission(konnector, konnectors.buildFolderPermission(folder))
      await addReferencesTo(konnector, [folder])
    }

    return await createTrigger(
      triggers.buildAttributes({
        account,
        cron: cron.fromKonnector(konnector),
        folder,
        konnector
      })
    )
  }

  /**
   * Account save success handler
   * @param  {Object}  account Created io.cozy.accounts document
   * @return {Object}          io.cozy.jobs document, runned with account data
   */
  async handleAccountSaveSuccess(account) {
    this.setState({ account })
    const trigger = await this.ensureTrigger()
    this.setState({ trigger })
    this.props.watchKonnectorAccount(account, {
      onTwoFACodeAsked: this.handleTwoFACodeAsked
    })
    return await this.launch(trigger)
  }

  handleError(error) {
    this.setState({
      error,
      status: ERRORED
    })
  }

  handleTwoFACodeAsked(statusCode) {
    const { jobWatcher, status } = this.state
    if (accounts.isTwoFANeeded(status)) return
    // disable successTimeout since asked Two FA code
    if (jobWatcher) jobWatcher.disableSuccessTimer()
    this.setState({
      status: statusCode
    })
  }

  async handleSubmitTwoFACode(code) {
    const { findAccount, konnector, saveAccount } = this.props
    const { account, jobWatcher } = this.state
    this.setState({
      error: null,
      status: RUNNING_TWOFA
    })
    try {
      /* We fetch before to avoid conflicts since the account can be changed
      in the database by the konnector */
      const upToDateAccount = findAccount(account._id)
      await saveAccount(
        konnector,
        accounts.updateTwoFaCode(upToDateAccount, code)
      )
      if (jobWatcher) jobWatcher.enableSuccessTimer(10000)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async handleSubmit(data) {
    const { konnector, saveAccount } = this.props

    const { account } = this.state
    const isUpdate = !!account

    this.setState({
      error: null,
      status: RUNNING
    })

    try {
      const savedAccount = accounts.mergeAuth(
        await saveAccount(
          konnector,
          isUpdate
            ? accounts.mergeAuth(account, data)
            : accounts.build(konnector, data)
        ),
        data
      )
      return this.handleAccountSaveSuccess(savedAccount)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Handle a success, typically job success or login success
   * @param  {Function} successCallback Typically onLoginSuccess or onSuccess
   * @param  {Array} args            Callback arguments
   */
  handleSuccess(successCallback, args) {
    this.setState({ status: IDLE })
    successCallback(...args)
  }

  /**
   * Launches a trigger
   * @param  {Object}  trigger io.cozy.triggers document
   * @return {Promise}         [description]
   */
  async launch(trigger) {
    const {
      launchTrigger,
      onLoginSuccess,
      onSuccess,
      watchKonnectorJob
    } = this.props

    const jobWatcher = watchKonnectorJob(await launchTrigger(trigger), {
      onError: this.handleError,
      onLoginSuccess: () => this.handleSuccess(onLoginSuccess, [trigger]),
      onSuccess: () => this.handleSuccess(onSuccess, [trigger])
    })
    this.setState({
      jobWatcher
    })
  }

  render() {
    const {
      konnector,
      running,
      showError,
      twoFANeeded,
      modalContainerId
    } = this.props
    const { account, error, status } = this.state
    const submitting = status === RUNNING || running
    const submittingTwoFA = status === RUNNING_TWOFA
    const waitForTwoFACode = accounts.isTwoFANeeded(status) || twoFANeeded
    const modalInto = modalContainerId || MODAL_PLACE_ID

    return (
      <div>
        <div id={modalInto} />
        <AccountForm
          account={account}
          error={error}
          konnector={konnector}
          onSubmit={this.handleSubmit}
          showError={showError}
          submitting={submitting || submittingTwoFA || waitForTwoFACode}
        />
        {(waitForTwoFACode || submittingTwoFA) && (
          <TwoFAForm
            account={account}
            konnector={konnector}
            handleSubmitTwoFACode={this.handleSubmitTwoFACode}
            submitting={submittingTwoFA}
            into={modalInto}
          />
        )}
      </div>
    )
  }
}

TriggerManager.propTypes = {
  /**
   * Account document. Used to get intial form values.
   * If no account is passed, AccountForm will use empty initial values.
   * @type {Object}
   */
  account: PropTypes.object,
  /**
   * Konnector document. AccountForm will check the `fields` object to compute
   * fields.
   * @type {Object}
   */
  konnector: PropTypes.object.isRequired,
  /**
   * Indicates if the TriggerManager has to show errors. Sometimes errors may be
   * displayed elsewhere. However, a KonnectorJobError corresponding to a login
   * error is always displayed. Transmitted to AccountForm.
   * @type {Boolean}
   */
  showError: PropTypes.bool,
  /**
   * Existing trigger document to manage.
   * @type {Object}
   */
  trigger: PropTypes.object,
  /**
   * Indicates if the given trigger is already running, i.e. if it has been
   * launched and if an associated job with status 'running' exists.
   * @type {[type]}
   */
  running: PropTypes.bool,
  /**
   * Translation function
   */
  t: PropTypes.func,
  //
  // mutations
  //
  /**
   * Permission mutation
   * @type {Function}
   */
  addPermission: PropTypes.func,
  /**
   * File mutation
   * @type {Function}
   */
  addReferencesTo: PropTypes.func,
  /**
   * Trigger mutation
   * @type {Function}
   */
  createTrigger: PropTypes.func.isRequired,
  /**
   * Trigger mutations
   * @type {Function}
   */
  createDirectoryByPath: PropTypes.func,
  /**
   * Trigger mutation
   * @type {Function}
   */
  launchTrigger: PropTypes.func.isRequired,
  /**
   * Account mutation
   * @type {Func}
   */
  saveAccount: PropTypes.func.isRequired,
  /**
   * Trigger mutations
   * @type {Function}
   */
  statDirectoryByPath: PropTypes.func,
  /**
   * Job mutations
   * @type {Function}
   */
  watchKonnectorJob: PropTypes.func.isRequired,
  //
  // Callbacks
  //
  /**
   * Callback invoked when the trigger has been launched and the login to the
   * remote service has succeeded.
   * @type {Function}
   */
  onLoginSuccess: PropTypes.func,
  /**
   * Callback invoked when the trigger has been launched and the job ended
   * successfully.
   * @type {Function}
   */
  onSuccess: PropTypes.func
}

export default translate()(
  withMutations(
    accountsMutations,
    filesMutations,
    permissionsMutations,
    triggersMutations
  )(TriggerManager)
)
