import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'

import { creditApplicationTemplate } from 'cozy-procedures'
import { withClient } from 'cozy-client'
import { AdministrativeProcedure } from 'cozy-doctypes'
import CozyRealtime from 'cozy-realtime'
import {
  Alerter,
  Title,
  SubTitle,
  Caption,
  Button,
  translate
} from 'cozy-ui/transpiled/react'
import InlineCard from 'cozy-ui/transpiled/react/InlineCard'

import Topbar from './Topbar'

class Overview extends React.Component {
  realtime = null

  componentWillUnmount() {
    if (this.realtime) {
      this.realtime.unsubscribeAll()
    }
  }

  navigateTo = view => {
    const { location, router } = this.props
    const rootPath = location.pathname
    const separator = rootPath.endsWith('/') ? '' : '/'
    router.push(`${rootPath}${separator}${view}`)
  }

  ensureRealtime = () => {
    if (!this.realtime) {
      this.realtime = new CozyRealtime({ client: this.props.client })
    }
  }

  handleZipChanged = jsonFile => job => {
    const { client, t } = this.props
    if (job.state === 'done') {
      Alerter.success(t('overview.zip_ready'))
      client.collection('io.cozy.files').destroy(jsonFile)
    }
  }

  getDestinationId = template => {
    const { client } = this.props
    return client
      .collection('io.cozy.files')
      .ensureDirectoryExists(template.pathToSave)
  }

  getFilesForZip = (jsonFile, documentsData) => {
    const files = {
      [jsonFile.name]: jsonFile.id
    }
    Object.keys(documentsData).forEach(categoryName => {
      const documentCategory = documentsData[categoryName]
      documentCategory.files.forEach(f => {
        const identifier = `documents/${f.name}`
        files[identifier] = f.id
      })
    })

    return files
  }

  submitProcedure = async () => {
    const { client, data } = this.props
    const template = creditApplicationTemplate
    try {
      const destinationId = await this.getDestinationId(template)
      const datetime = new Date().toISOString()
      const baseFilename = `${template.type}-${datetime}`
      const jsonFilename = `${baseFilename}.json`
      const administrativeProcedure = AdministrativeProcedure.create(
        data,
        creditApplicationTemplate
      )
      const response = await client.create(
        'io.cozy.procedures.administratives',
        administrativeProcedure
      )
      const jsonData = AdministrativeProcedure.createJson(response.data)

      const file = new File([jsonData], jsonFilename)
      const resp = await client
        .collection('io.cozy.files')
        .createFile(file, { dirId: destinationId })

      const jsonFile = {
        id: resp.data.id,
        name: jsonFilename
      }

      const files = this.getFilesForZip(jsonFile, data.documentsData)
      const params = {
        files,
        dir_id: destinationId,
        filename: `${baseFilename}.zip`
      }
      this.ensureRealtime()
      const zipResp = await client
        .collection('io.cozy.jobs')
        .create('zip', params)

      await this.realtime.subscribe(
        'updated',
        'io.cozy.jobs',
        zipResp.data.id,
        this.handleZipChanged(jsonFile)
      )
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const {
      personalDataFieldsCompleted,
      personalDataFieldsTotal,
      data,
      t
    } = this.props
    const { amount, duration } = data.procedureData

    return (
      <div>
        <Topbar title={creditApplicationTemplate.name} />
        <Title className="u-mb-2">{t('overview.subtitle')}</Title>
        <section className="u-mb-2">
          <SubTitle className="u-mb-1">{t('overview.request')}</SubTitle>
          <div className="u-flex u-flex-items-center">
            {amount !== null ? (
              <InlineCard onClick={() => this.navigateTo('amount')}>
                {t('overview.amountUnit', {
                  smart_count: amount
                })}
              </InlineCard>
            ) : (
              <Button
                label={t('overview.amount')}
                theme="ghost"
                onClick={() => this.navigateTo('amount')}
              />
            )}
            <span className="u-ph-half">{t('overview.over')}</span>
            {duration !== null ? (
              <InlineCard onClick={() => this.navigateTo('duration')}>
                {t('overview.durationUnit', {
                  smart_count: duration
                })}
              </InlineCard>
            ) : (
              <Button
                label={t('overview.duration')}
                theme="ghost"
                onClick={() => this.navigateTo('duration')}
              />
            )}
          </div>
        </section>
        <section className="u-mb-2">
          <SubTitle className="u-mb-1">{t('overview.documents')}</SubTitle>
          <Button
            label={t('overview.complete')}
            extraRight={'0/0'}
            onClick={() => this.navigateTo('documents')}
            theme="ghost"
            extension="full"
            icon="pen"
          />
        </section>
        <section className="u-mb-2">
          <SubTitle className="u-mb-1">{t('overview.personalData')}</SubTitle>
          <Button
            label={t('overview.complete')}
            extraRight={`${personalDataFieldsCompleted}/${personalDataFieldsTotal}`}
            onClick={() => this.navigateTo('personal')}
            theme="ghost"
            extension="full"
            icon="pen"
          />
        </section>
        <Caption className="u-mb-1">{t('overview.notice')}</Caption>
        <Button
          label={t('overview.button')}
          extension="full"
          onClick={this.submitProcedure}
        />
      </div>
    )
  }
}

Overview.propTypes = {
  personalDataFieldsCompleted: PropTypes.number,
  personalDataFieldsTotal: PropTypes.number,
  duration: PropTypes.number,
  amount: PropTypes.number,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  router: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  t: PropTypes.func.isRequired
}

Overview.defaultProps = {
  personalDataFieldsCompleted: 0,
  personalDataFieldsTotal: 0,
  location: {
    pathname: '/'
  }
}

export default translate()(withRouter(withClient(Overview)))
