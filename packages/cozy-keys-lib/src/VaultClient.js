class VaultClient {
  constructor() {
    this.unlocked = false
  }

  unlock() {
    this.unlocked = true
    this.onUnlock()
  }

  lock() {
    this.unlocked = false
  }

  isUnlocked() {
    return this.unlocked
  }
}

export default VaultClient
