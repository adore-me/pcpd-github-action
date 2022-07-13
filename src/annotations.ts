import * as core from '@actions/core'
import {CPDReport, Duplication} from './cpd'
import parser from 'fast-xml-parser'
import fs from 'fs'
import BufferEncoding from 'buffer'
import * as path from 'path'
import {Annotation, AnnotationLevel} from './github'
import {map} from 'ramda'
import decode from 'unescape'

const XML_PARSE_OPTIONS = {
  allowBooleanAttributes: true,
  ignoreAttributes: false,
  attributeNamePrefix: ''
}

function asArray<T>(arg: T[] | T | undefined): T[] {
  return !arg ? [] : Array.isArray(arg) ? arg : [arg]
}

export function annotationsForPath(resultFile: string): Annotation[] {
  core.info(`Creating annotations for ${resultFile}`)
  const root: string = process.env['GITHUB_WORKSPACE'] || ''

  const result: CPDReport = parser.parse(
    fs.readFileSync(resultFile, 'UTF-8' as BufferEncoding),
    XML_PARSE_OPTIONS
  )

  return map(duplication => {
    let filesWithLines = ''
    // eslint-disable-next-line github/array-foreach
    duplication.file.forEach(file => {
      filesWithLines += `- in file: \`${file.path}\` at line \`${file.line}\`\n`
    })

    const message = `
Lines duplicated: ${duplication.lines} in ${duplication.file.length} places\n
Duplications:
${filesWithLines}
Code:
\`\`\`typescript
${duplication.codefragment}
\`\`\`
`

    const annotation: Annotation = {
      annotation_level: AnnotationLevel.warning,
      path: path.relative(root, duplication.file[0].path),
      start_line: Number(duplication.file[0].line),
      end_line: Number(duplication.file[0].line) + Number(duplication.lines),
      title: `Duplicate code detected`,
      message: decode(message)
    }

    return annotation
  }, asArray<Duplication>(result['pmd-cpd']?.duplication))
}
