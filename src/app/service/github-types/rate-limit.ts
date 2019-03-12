interface GithubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

interface GithubRateLimitResponse {
  core: GithubRateLimit;
  search: GithubRateLimit;
  graphql: GithubRateLimit;
  integration_manifest: GithubRateLimit;
}