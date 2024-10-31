import { MediaTypeQuery } from '~/types/search.types'

export const AUTH_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_BETWEEN_1_AND_100: 'Name length must be between 1 and 100',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50: 'Password length must be between 6 and 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50: 'Confirm password length must be between 6 and 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be in ISO 8601 format',
  LOGIN_SUCCESS: 'Login successfully',
  REGISTER_SUCCESS: 'Register successfully',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify successfully',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verify successfully',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check your email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password successfully',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully'
} as const

export const USERS_MESSAGES = {
  GET_ME_SUCCESS: 'Get my profile successfully',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio length must be between 1 and 200',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location length must be between 1 and 200',
  WEBSITE_MUST_BE_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website length must be between 1 and 200',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  USERNAME_LENGTH: 'Username length must be between 1 and 50',
  USERNAME_INVALID:
    'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only numbers',
  IMAGE_URL_MUST_BE_STRING: 'Image URL must be a string',
  IMAGE_URL_LENGTH: 'Image URL length must be between 1 and 400',
  UPDATE_ME_SUCCESS: 'Update my profile successfully',
  GET_PROFILE_SUCCESS: 'Get profile successfully',
  FOLLOW_SUCCESS: 'Follow successfully',
  INVALID_USER_ID: 'Invalid followed user id',
  FOLLOWED: 'Followed',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_SUCCESS: 'Unfollow successfully',
  USERNAME_EXISTED: 'Username existed',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password successfully',
  GET_RANDOM_USERS_SUCCESS: 'Get random users successfully'
}

export const MEDIAS_MESSAGES = {
  UPLOAD_SUCCESS: 'Upload successfully',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successfully'
}

export const TWEETS_MESSAGES = {
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  PARENT_TWEET_NOT_FOUND: 'Parent tweet not found',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non-empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user id',
  DUPLICATE_MENTIONS_NOT_ALLOWED: 'Duplicate mentions not allowed',
  METIONS_NOT_FOUND: 'Mention users not found',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
  CREATE_TWEET_SUCCESS: 'Create tweet successfully',
  INVALID_TWEET_ID: 'Invalid tweet id',
  TWEET_NOT_FOUND: 'Tweet not found',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  GET_TWEET_DETAIL_SUCCESS: 'Get tweet detail successfully',
  GET_TWEET_CHILDREN_SUCCESS: 'Get tweet children successfully',
  GET_NEW_FEEDS_SUCCESS: 'Get new feeds successfully',
  GET_BOOKMARK_TWEETS_SUCCESS: 'Get bookmark tweets successfully',
  KEYWORD_MUST_BE_A_STRING: 'Keyword must be a string',
  GET_LIKE_TWEETS_SUCCESS: 'Get like tweets successfully',
  GET_RANDOM_NEW_FEEDS_SUCCESS: 'Get random new feeds successfully'
} as const

export const BOOKMARKS_MESSAGES = {
  BOOKMARK_SUCCESSFULLY: 'Bookmark successfully',
  UNBOOKMARK_SUCCESSFULLY: 'Unbookmark successfully'
} as const

export const LIKE_MESSAGES = {
  LIKE_SUCCESSFULLY: 'Like successfully',
  UNLIKE_SUCCESSFULLY: 'Unlike successfully'
} as const

export const SEARCH_MESSAGES = {
  SEARCH_SUCCESSFULLY: 'Search successfully',
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  MEDIA_TYPE_MUST_BE_A_VALID_MEDIA_TYPE: `Media type must be one of ${Object.values(MediaTypeQuery).join(', ')}`,
  PEOPLE_FOLLOW_MUST_BE_0_OR_1: 'People follow must be 0 or 1'
} as const

export const CONVERSATION_MESSAGES = {
  GET_CONVERSATIONS_SUCCESSFULLY: 'Get conversations successfully'
}

export const NOTIFICATIONS_MESSAGES = {
  GET_NOTIFICATIONS_SUCCESSFULLY: 'Get notifications successfully'
}
