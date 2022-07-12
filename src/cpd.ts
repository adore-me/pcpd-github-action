export interface CPDReport {
  cpd?: CPD
}

export interface CPD {
  file: File[] | File | undefined
}

export interface File {
  name: string
  duplication: Duplication[] | Duplication | undefined
}

export interface FilePaths {
  path: string
  line: string
}

export interface Duplication {
  lines: string
  tokens: string
  files: FilePaths[]
  codefragment: string
}
