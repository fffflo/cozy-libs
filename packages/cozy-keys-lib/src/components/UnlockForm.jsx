import React from 'react'
import PropTypes from 'prop-types'
import Modal, { ModalContent, ModalFooter } from 'cozy-ui/transpiled/react/modal'
import { MainTitle, Text } from 'cozy-ui/transpiled/react/Text'
import Icon from 'cozy-ui/transpiled/react/Icon'
import Field from 'cozy-ui/transpiled/react/Field'
import Button from 'cozy-ui/transpiled/react/Button'

// const { client } = React.useContext(VaultContext)

class UnlockForm extends React.Component {
  state = {
    password: ''
  }

  render () {
    return (
      <Modal mobileFullscreen className="u-bg-dodgerBlue">
        <ModalContent fixed className="u-flex u-flex-column u-flex-items-center u-flex-grow-1 u-bg-dodgerBlue">
          <Icon icon="cloud" size={80} color="red" className="u-mb-half" />
          <MainTitle className="u-white">lol</MainTitle>
          <Text className="u-mb-1-half u-white">lalala</Text>

          <Field
            id="idField"
            label="I'm a label"
            type="password"
            value={this.state.password}
            onChange={e => this.setState({ password: e.currentTarget.value })}
            fullwidth
            className="u-w-100 u-white"
            secondaryLabels={{
              hideLabel: "Hide",
              showLabel: "Show"
            }}
          />
        </ModalContent>
        <ModalFooter className="u-flex u-flex-justify-end">
          <Button label="quitter" theme="secondary" className="u-mr-half u-w-100-t" />
          <Button label="unlock" className="u-w-100-t" />
        </ModalFooter>
      </Modal>
    )
  }
}

export default UnlockForm
