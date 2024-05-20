import { Blog } from '../../../domain/blog.sql-entity'

export class BlogOutputModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
    public createdAt: Date,
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
}: Blog): BlogOutputModel => {
  return new BlogOutputModel(id, name, description, websiteUrl, isMembership, createdAt)
}
