export enum ErrorMessages {
  EMPTY_BODY = 'Empty body.',
  TYPE_MISMATCH = '{key} needs to be a string.',
  REQUIRED_TITLE = 'Title is required.',
  TITLE_FORMAT = 'Title must only have letters and/or numbers.',
  TITLE_LENGTH = 'Title must be more than 5 and less than 100 characters long.',
  STATUS_ENUM = `Status could be one of the set: [{statusses}]`,
  FALLBACK_ERROR = `Body needs to be an object of the type: \n {sampleInput}`
}
