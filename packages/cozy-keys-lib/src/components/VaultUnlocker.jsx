import React from 'react'
import { VaultContext } from './VaultContext'
import UnlockForm from './UnlockForm'

const VaultUnlocker = ({ children }) => {
  const { client } = React.useContext(VaultContext)
  return client.isUnlocked() ? children : (
    <UnlockForm />
  )
}

export default VaultUnlocker
