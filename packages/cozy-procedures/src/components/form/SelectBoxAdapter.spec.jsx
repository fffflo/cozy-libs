import React from 'react'

import tMock from '../../../test/__mocks__/tMock'
import { SelectBoxAdapter } from './SelectBoxAdapter'

describe('SelectBoxAdapter component', () => {
  it('should match snapshot', () => {
    const onChangeSpy = jest.fn()
    const props = {
      onChange: onChangeSpy,
      options: {
        enumOptions: [
          { label: 'Foo', value: 'foo' },
          { label: 'Bar', value: 'bar' }
        ]
      },
      t: tMock,
      value: 'foo'
    }
    const component = shallow(<SelectBoxAdapter {...props} />)
    expect(component).toMatchSnapshot()
  })
})
