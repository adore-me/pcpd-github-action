import * as core from '@actions/core'
import {File, CPDReport, Duplication} from './cpd'
import parser from 'fast-xml-parser'
import fs from 'fs'
import BufferEncoding from 'buffer'
import * as path from 'path'
import {Annotation, AnnotationLevel} from './github'
import {chain, map} from 'ramda'
import decode from 'unescape'

const XML_PARSE_OPTIONS = {
  allowBooleanAttributes: true,
  ignoreAttributes: false,
  attributeNamePrefix: ''
}

function asArray<T>(arg: T[] | T | undefined): T[] {
  return !arg ? [] : Array.isArray(arg) ? arg : [arg]
}

function getWarningLevel(arg: string | number): AnnotationLevel {
  switch (arg) {
    case '1':
      return AnnotationLevel.failure
    case '2':
    case '3':
      return AnnotationLevel.warning
    default:
      return AnnotationLevel.notice
  }
}

export function annotationsForPath(resultFile: string): Annotation[] {
  core.info(`Creating annotations for ${resultFile}`)
  const root: string = process.env['GITHUB_WORKSPACE'] || ''

  const result: CPDReport = parser.parse(
    fs.readFileSync(resultFile, 'UTF-8' as BufferEncoding),
    XML_PARSE_OPTIONS
  )

  core.info(`Parsed ${resultFile}:`)
  core.info(`resultFile: ${result}`)

  return chain((file: { name: string; duplication: Duplication }) => {
    return map(duplication => {
      const annotation: Annotation = {
        annotation_level: AnnotationLevel.warning,
        path: path.relative(root, file.name),
        start_line: Number(duplication.lines),
        end_line: Number(duplication.lines),
        title: `Duplicate code detected`,
        message: decode(duplication.codefragment)
      }

      return annotation
    }, asArray(file.duplication))
  }, asArray<File>(result.cpd?.file))
}
