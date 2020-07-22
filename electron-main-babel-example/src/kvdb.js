import levelup from 'levelup'
import leveldown from 'leveldown'

const db = levelup(leveldown('./mydb'))

export { db }
