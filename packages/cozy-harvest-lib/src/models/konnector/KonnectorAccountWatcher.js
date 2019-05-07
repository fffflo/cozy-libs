import CozyRealtime from 'cozy-realtime'
import accounts from '../../helpers/accounts'

const ACCOUNT_DOCTYPE = 'io.cozy.accounts'

export class KonnectorAccountWatcher {
  constructor(client, account, options) {
    this.realtime = new CozyRealtime({ cozyClient: client })
    this.account = account
    this.options = options
    this.handleAccountUpdated = this.handleAccountUpdated.bind(this)
  }

  handleAccountUpdated(account) {
    this.account = account
    const { state } = this.account
    const { onTwoFACodeAsked, onLoginSuccessHandled } = this.options
    if (accounts.isTwoFANeeded(state) || accounts.isTwoFARetry(state)) {
      onTwoFACodeAsked(state)
    }
    if (accounts.isLoginSuccessHandled(state)) {
      onLoginSuccessHandled(state)
    }
  }

  async watch() {
    this.realtime.subscribe(
      'updated',
      ACCOUNT_DOCTYPE,
      this.account._id,
      this.handleAccountUpdated
    )
  }
}

export default KonnectorAccountWatcher
