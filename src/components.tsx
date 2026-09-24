export type PackId = 'news' | 'arch' | 'kraft' | 'copy' | 'fax' | 'mime' | 'red' | 'snap'

export const PACKS: PackId[] = ['news', 'arch', 'kraft', 'copy', 'fax', 'mime', 'red', 'snap']

export function TplThumb({ id }: { id: PackId }) {
  return (
    <div className={`th th-${id}`}>
      <i className="th-h" />
      <i className="th-l" />
      <i className="th-l2" />
    </div>
  )
}
