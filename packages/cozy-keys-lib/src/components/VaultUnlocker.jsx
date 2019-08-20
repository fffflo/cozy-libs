import React from 'react'
import { VaultContext } from './VaultContext'

const UnlockForm = ({ onSubmit }) => <button onClick={onSubmit}>unlock</button>

const VaultUnlocker = ({ children }) => {
  const { client } = React.useContext(VaultContext)
  return client.isUnlocked() ? children : (
    <UnlockForm onSubmit={() => client.unlock()} />
  )
}

export default VaultUnlocker
