export class InstagramUserProfileDto {
  /** The Instagram user's name (can be null if name not set) */
  name?: string;

  /** The Instagram user's username */
  username?: string;

  /** URL for the Instagram user's profile picture (expires in a few days) */
  profile_pic?: string;

  /** Number of followers the Instagram user has */
  follower_count?: number;

  /** Whether the Instagram user follows your app user's account */
  is_user_follow_business?: boolean;

  /** Whether your app user follows the Instagram user */
  is_business_follow_user?: boolean;

  /** Whether the Instagram user has a verified account */
  is_verified_user?: boolean;

  /** The Instagram-scoped ID for the user */
  id: string;
}
