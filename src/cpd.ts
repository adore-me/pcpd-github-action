export interface CPDReport {
  'pmd-cpd'?: CPD
}

export interface CPD {
  duplication: Duplication[]
}

export interface Duplication {
  lines: string
  tokens: string
  file: File[]
  codefragment: string
}

export interface File {
  path: string
  line: string
}
