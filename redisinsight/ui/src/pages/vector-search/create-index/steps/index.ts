import { SelectDatabaseStep } from './SelectDatabaseStep'
import { AddDataStep } from './AddDataStep'
import { CreateIndexStep } from './CreateIndexStep'

export * from './config'
export const stepContents = [SelectDatabaseStep, AddDataStep, CreateIndexStep]
