const Document = require('../Document')
const BankAccount = require('./BankAccount')
const exportInstanceAndClass = require('../utils').exportInstanceAndClass

class BalanceHistory extends Document.originalClass {
  constructor () {
    super()
    this.doctype = 'io.cozy.bank.balancehistories'
    this.idAttributes = ['year', 'relationships.account.data._id']
    this.version = 1
    this.checkedAttributes = ['balances']
  }

  async getByYearAndAccount(year, accountId) {
    const index = await Document.getIndex(this.doctype, this.idAttributes)
    const options = {
      selector: { year, 'relationships.account.data._id': accountId },
      limit: 1
    }
    const [balance] = await Document.query(index, options)

    if (balance) {
      return balance
    }

    return this.getEmptyDocument(year, accountId)
  }

  getEmptyDocument(year, accountId) {
    return {
      year,
      balances: {},
      metadata: {
        version: this.version
      },
      relationships: {
        account: {
          data: {
            _id: accountId,
            _type: BankAccount.doctype
          }
        }
      }
    }
  }
}

module.exports = exportInstanceAndClass(BalanceHistory)
