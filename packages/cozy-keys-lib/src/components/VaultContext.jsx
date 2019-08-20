import React from 'react'
import VaultClient from '../VaultClient'

const client = new VaultClient()
const VaultContext = React.createContext()

class VaultProvider extends React.Component {
  componentDidMount() {
    client.onUnlock = () => this.forceUpdate()
  }

  render() {
    return (
      <VaultContext.Provider value={{ client }}>
        {this.props.children}
      </VaultContext.Provider>
    )
  }
}

export { VaultContext, VaultProvider }
