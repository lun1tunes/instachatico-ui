import en, { type TranslationSchema } from './en'
import ru from './ru'

export const messages = {
  en,
  ru
}

export type LocaleKey = keyof typeof messages
export type MessagesSchema = TranslationSchema
