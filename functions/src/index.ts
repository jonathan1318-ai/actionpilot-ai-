import * as admin from 'firebase-admin'

admin.initializeApp()

export { extractTasks } from './extraction/extractTasks'
