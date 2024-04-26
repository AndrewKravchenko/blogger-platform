import { BlogDocument } from '../../../domain/blog.entity'

export class BlogOutputModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
    public createdAt: string,
  ) {}
}

// MAPPERS

export const BlogOutputMapper = ({
  id,
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
}: BlogDocument): BlogOutputModel => {
  return new BlogOutputModel(id, name, description, websiteUrl, isMembership, createdAt)
}
