import React from 'react'
import PropTypes from 'prop-types'
import Modal, {
  ModalContent,
  ModalFooter
} from 'cozy-ui/transpiled/react/modal'
import { MainTitle, Text } from 'cozy-ui/transpiled/react/Text'
import Icon from 'cozy-ui/transpiled/react/Icon'
import Field from 'cozy-ui/transpiled/react/Field'
import Button from 'cozy-ui/transpiled/react/Button'
import CloudIcon from '../../assets/icon-cozy-security.svg'
import palette from 'cozy-ui/transpiled/react/palette'
// const { client } = React.useContext(VaultContext)

class UnlockForm extends React.Component {
  state = {
    password: ''
  }

  render() {
    return (
      <Modal
        mobileFullscreen
        className="u-bg-dodgerBlue"
        closeBtnColor={palette['white']}
      >
        <ModalContent
          fixed
          className="u-flex u-flex-column u-flex-items-center u-flex-grow-1 u-bg-dodgerBlue u-bdw-0"
        >
          <div className="u-mt-3">
            <CloudIcon />
          </div>
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
            secondaryComponent={({ visible }) =>
              visible ? <Icon icon="eye-closed" /> : <Icon icon="eye" />
            }
            labelProps={{ className: 'u-white' }}
          />
        </ModalContent>
        <ModalFooter className="u-flex u-flex-justify-end">
          <Button label="quitter" className="u-mr-half u-w-100-t" />
          <Button
            label="unlock"
            theme="secondary"
            className="u-w-100-t u-dodgerBlue"
          />
        </ModalFooter>
      </Modal>
    )
  }
}

export default UnlockForm
