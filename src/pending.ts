import type { PackId } from './components'

/** hand-off store: homepage quick-start → scan lab */
export const pending: { file: File | null; pack: PackId | null } = { file: null, pack: null }
