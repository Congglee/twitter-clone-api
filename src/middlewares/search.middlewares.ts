import { checkSchema } from 'express-validator'
import { SEARCH_MESSAGES } from '~/config/messages'
import { MediaTypeQuery, PeopleFollow } from '~/types/search.types'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: { errorMessage: SEARCH_MESSAGES.CONTENT_MUST_BE_A_STRING }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)],
          errorMessage: SEARCH_MESSAGES.MEDIA_TYPE_MUST_BE_A_VALID_MEDIA_TYPE
        }
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(PeopleFollow)],
          errorMessage: SEARCH_MESSAGES.PEOPLE_FOLLOW_MUST_BE_0_OR_1
        }
      }
    },
    ['query']
  )
)
