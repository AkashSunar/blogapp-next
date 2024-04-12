import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {} // This allows you to use methods provided by PrismaService within BlogService.

  accessTokensecret = process.env.ACCESS_TOKEN_SECRET;
  refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  async create(createBlogDto: CreateBlogDto) {
    const createdBlog = await this.prisma.blog.create({ data: createBlogDto });
    return { msg: 'Blog created successfully', data: createdBlog };
  }
  async getAllBlogs() {
    return await this.prisma.blog.findMany({});
  }
  async findAll(createrId: number) {
    return await this.prisma.blog.findMany({
      where: { userId: createrId },
    });
  }

  async update(
    blogId: number,
    updateBlogDto: UpdateBlogDto,
    creatorId: number,
  ) {
    const blogToBeUpdated = await this.prisma.blog.findUnique({
      where: {
        id: Number(blogId),
      },
    });
    if (!blogToBeUpdated)
      throw new HttpException(
        'Blog you want to update is not found',
        HttpStatus.BAD_REQUEST,
      );
    if (creatorId !== blogToBeUpdated.userId)
      throw new HttpException(
        'This Blog is not created by the user you provided',
        HttpStatus.BAD_REQUEST,
      );
    const updatedBlog = await this.prisma.blog.update({
      where: { id: Number(blogId) },
      data: updateBlogDto,
    });
    return { msg: 'Blog updated successfully', data: updatedBlog };
  }

  async remove(blogId: number, creatorId: number) {
    const blogToBedeleted = await this.prisma.blog.findUnique({
      where: { id: Number(blogId) },
    });
    if (!blogToBedeleted)
      throw new HttpException(
        'Blog you want to delete is not found',
        HttpStatus.BAD_REQUEST,
      );
    if (creatorId !== blogToBedeleted.userId)
      throw new HttpException(
        'This Blog is not created by the user you provided',
        HttpStatus.BAD_REQUEST,
      );
    await this.prisma.blog.delete({ where: { id: Number(blogId) } });
    return { msg: 'Deleted succesfully' };
  }
}
