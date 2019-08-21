import React from 'react'
import VaultClient from '../VaultClient'

const VaultContext = React.createContext()

class VaultProvider extends React.Component {
  state = {
    client: null
  }

  componentDidMount() {
    const client = new VaultClient(this.props.url)
    client.onUnlock = () => this.forceUpdate()
    this.setState({
      client
    })
  }

  render() {
    const { client } = this.state
    return client ? (
      <VaultContext.Provider value={{ client }}>
        {this.props.children}
      </VaultContext.Provider>
    ) : null
  }
}

export { VaultContext, VaultProvider }
