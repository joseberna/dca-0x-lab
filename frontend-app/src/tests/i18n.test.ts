import { describe, it, expect } from 'vitest'
import { getLang } from '../i18n'

describe('i18n', () => {
  it('should return English translations', () => {
    const t = getLang('en')
    expect(t.navbar.title).toBe('💸 DCA Dashboard')
    expect(t.nav.home).toBe('Home')
  })

  it('should return Spanish translations', () => {
    const t = getLang('es')
    expect(t.navbar.title).toBe('💸 DCA Dashboard')
    expect(t.nav.home).toBe('Inicio')
  })

  it('should return Portuguese translations', () => {
    const t = getLang('pt')
    expect(t.navbar.title).toBe('💸 DCA Dashboard')
    expect(t.nav.home).toBe('Início')
  })

  it('should have consistent structure across languages', () => {
    const en = getLang('en')
    const es = getLang('es')
    const pt = getLang('pt')

    // Check that all languages have the same keys
    expect(Object.keys(en)).toEqual(Object.keys(es))
    expect(Object.keys(en)).toEqual(Object.keys(pt))
  })

  it('should have toast translations', () => {
    const t = getLang('en')
    expect(t.toast.planCreatedTitle).toBeDefined()
    expect(t.toast.transactionFailed).toBeDefined()
  })

  it('should have pages translations', () => {
    const t = getLang('en')
    expect(t.pages.myPlans.title).toBeDefined()
    expect(t.pages.planDetail.title).toBeDefined()
  })
})
