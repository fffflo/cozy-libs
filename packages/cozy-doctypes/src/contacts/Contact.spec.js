import Contact from './Contact'

describe('Contact model', () => {
  describe('getInitials method', () => {
    it("should return the contact's initials from the name", () => {
      const contact = {
        name: {
          givenName: 'Arya',
          familyName: 'Stark'
        }
      }
      const result = Contact.getInitials(contact)
      expect(result).toEqual('AS')
    })

    it('should return the first letter if input is a string', () => {
      const result = Contact.getInitials('arya.stark@thenorth.westeros')
      expect(result).toEqual('A')
    })
  })

  describe('getPrimaryEmail', () => {
    it('should return the main email', () => {
      const contact = {
        email: [
          {
            address: 'beth@braavos.essos',
            primary: false
          },
          {
            address: 'arya.stark@thenorth.westeros',
            primary: true
          }
        ]
      }
      const result = Contact.getPrimaryEmail(contact)
      expect(result).toEqual('arya.stark@thenorth.westeros')
    })

    it('should return the first if there is no primary', () => {
      const contact = {
        email: [
          {
            address: 'beth@braavos.essos'
          },
          {
            address: 'arya.stark@thenorth.westeros'
          }
        ]
      }
      const result = Contact.getPrimaryEmail(contact)
      expect(result).toEqual('beth@braavos.essos')
    })

    it('should work with old doctype', () => {
      const contact = {
        email: 'arya.stark@thenorth.westeros'
      }
      const result = Contact.getPrimaryEmail(contact)
      expect(result).toEqual('arya.stark@thenorth.westeros')
    })
  })

  describe('getPrimaryCozy', () => {
    it('should return the main cozy', () => {
      const contact = {
        cozy: [
          {
            url: 'https://arya.mycozy.cloud',
            primary: true
          },
          {
            url: 'https://beth.mycozy.cloud',
            primary: false
          }
        ]
      }
      const result = Contact.getPrimaryCozy(contact)
      expect(result).toEqual('https://arya.mycozy.cloud')
    })

    it('should return the first if there is no primary', () => {
      const contact = {
        cozy: [
          {
            url: 'https://arya.mycozy.cloud'
          },
          {
            url: 'https://beth.mycozy.cloud'
          }
        ]
      }
      const result = Contact.getPrimaryCozy(contact)
      expect(result).toEqual('https://arya.mycozy.cloud')
    })

    it('should work with old doctype', () => {
      const contact = {
        url: 'https://arya.mycozy.cloud'
      }
      const result = Contact.getPrimaryCozy(contact)
      expect(result).toEqual('https://arya.mycozy.cloud')
    })
  })

  describe('getFullname function', () => {
    it("should return contact's fullname", () => {
      const contact = {
        fullname: 'Doran Martell',
        name: {
          givenName: 'Do',
          familyName: 'Martell'
        }
      }
      const result = Contact.getFullname(contact)
      expect(result).toEqual('Doran Martell')
    })

    it('should combine all name parts', () => {
      const contact = {
        fullname: '',
        name: {
          namePrefix: 'The Mother of Dragons',
          givenName: 'Daenerys',
          additionalName: 'The Unburnt',
          familyName: 'Targaryen',
          nameSuffix: 'Breaker of Chains'
        }
      }
      const result = Contact.getDisplayName(contact)
      expect(result).toEqual(
        'The Mother of Dragons Daenerys The Unburnt Targaryen Breaker of Chains'
      )
    })

    it("should return contact's givenName + familyName if no fullname", () => {
      const contact = {
        fullname: undefined,
        name: {
          givenName: 'Doran',
          familyName: 'Martell'
        }
      }
      const result = Contact.getFullname(contact)
      expect(result).toEqual('Doran Martell')
    })

    it("should return contact's givenName if no familyName", () => {
      const contact = {
        fullname: undefined,
        name: {
          givenName: 'Doran',
          familyName: ''
        }
      }
      const result = Contact.getFullname(contact)
      expect(result).toEqual('Doran')
    })

    it("should return contact's familyName if no givenName", () => {
      const contact = {
        fullname: undefined,
        name: {
          givenName: '',
          familyName: 'Martell'
        }
      }
      const result = Contact.getFullname(contact)
      expect(result).toEqual('Martell')
    })
  })

  describe('getDisplayName function', () => {
    it("should return the contact's fullname if any", () => {
      const contact = {
        fullname: 'Doran Martell',
        name: {
          givenName: 'Doran',
          familyName: 'Martell'
        },
        email: [
          {
            address: 'doran.martell@dorne.westeros',
            primary: true
          }
        ]
      }
      const result = Contact.getDisplayName(contact)
      expect(result).toEqual('Doran Martell')
    })

    it("should return the contact's name if no fullname", () => {
      const contact = {
        fullname: '',
        name: {
          givenName: 'Doran',
          familyName: 'Martell'
        },
        email: [
          {
            address: 'doran.martell@dorne.westeros',
            primary: true
          }
        ]
      }
      const result = Contact.getDisplayName(contact)
      expect(result).toEqual('Doran Martell')
    })

    it("should return the contact's primary email if no fullname and no name", () => {
      const contact = {
        fullname: undefined,
        name: undefined,
        email: [
          {
            address: 'doran.martell@dorne.westeros',
            primary: true
          }
        ]
      }
      const result = Contact.getDisplayName(contact)
      expect(result).toEqual('doran.martell@dorne.westeros')
    })
  })
})