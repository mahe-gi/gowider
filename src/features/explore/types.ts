export interface ExploreFeaturedProject {
  title: string;
  thumbnailUrl: string | null;
  category: string;
}

export interface ExploreCreator {
  username: string;
  displayName: string;
  headline: string;
  location: string | null;
  avatarUrl: string | null;
  projectCount: number;
  featuredProject: ExploreFeaturedProject | null;
}

export interface GetExploreCreatorsParams {
  search?: string;
  category?: string;
  limit?: number;
  cursor?: string;
}
