import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import exp from 'constants';

const blogData = {
  title: 'The Blog by user1',
  content: 'A beautiful blog createt by robert in the memory of his beloved',
  author: 'Akash Babu',
  likes: 1000,
  userId: 1,
};

const blogData = {
  title: 'The Blog by user1',
  content: 'A beautiful blog createt by robert in the memory of his beloved',
  author: 'Akash Babu',
  likes: 1000,
};

const blogs = [
  {
    id: 14,
    title: 'The Blog by user1',
    content: 'A beautiful blog createt by robert in the memory of his beloved',
    author: 'Akash Babu',
    likes: 1000,
    userId: 3,
  },
  {
    id: 15,
    title: 'The Blog by user2',
    content: 'A beautiful blog createt by robert in the memory of his beloved',
    author: 'Akash Babu',
    likes: 1000,
    userId: 2,
  },
  {
    id: 16,
    title: 'The Blog by user3',
    content: 'A beautiful blog createt by robert in the memory of his beloved',
    author: 'Akash Babu',
    likes: 1000,
    userId: 3,
  },
];

describe('BlogService', () => {
  let service: BlogService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogService, PrismaService],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create a Blog', () => {
    it(' should create a blog and save it', async () => {
      jest.spyOn(prisma.blog, 'create').mockResolvedValue(blogs[0]);
      const createdBlog = await service.create(blogData);
      expect(createdBlog).toEqual(blogs[0]);
      expect(prisma.blog.create).toHaveBeenCalledWith({ data: blogData });
    });
  });

  describe('Get the blogs', () => {
    it('should give all the blogs to the user who created them', async () => {
      jest.spyOn(prisma.blog, 'findMany').mockResolvedValue(blogs);
      const blogsRecieved = await service.findAll(3);
      expect(blogsRecieved).toEqual(blogs);
      expect(prisma.blog.findMany).toHaveBeenCalledWith({
        where: { userId: 3 },
      });
    });
  });

  describe('Update the  blog', () => {
    const updatedBlog = {
      id: 14,
      title: 'Upated title',
      content: 'Updated content',
      author: 'Updated author',
      likes: 1000,
      userId: 3,
    };
    it('should update the blog', async () => {
      jest.spyOn(prisma.blog, 'update').mockResolvedValue(updatedBlog);
      const updatedBlogResult = await service.update(14, updatedBlog, 3);
      expect(updatedBlogResult).toEqual({
        msg: 'Blog updated successfully',
        data: updatedBlog,
      });
      expect(prisma.blog.update).toHaveBeenCalledWith({
        where: { id: 14 },
        data: updatedBlog,
      });
    });

    it('should throw an error if blog is not found', async () => {
      jest.spyOn(prisma.blog, 'findUnique').mockResolvedValue(null);
      const updatedBlogResult = service.update(14, updatedBlog, 3);
      expect(updatedBlogResult).rejects.toThrow(
        'Blog you want to update is not found',
      );
      expect(prisma.blog.findUnique).toHaveBeenCalledWith({
        where: { id: 14 },
      });
    });

    it('should throw error if blog is not being deleted by its creator', async () => {
      jest.spyOn(prisma.blog, 'findUnique').mockResolvedValue(blogs[0]);
      const updatedBlogResult = service.update(14, updatedBlog, 4);
      expect(updatedBlogResult).rejects.toThrow(
        'This Blog is not created by the user you provider',
      );
      expect(prisma.blog.findUnique).toHaveBeenCalledWith({
        where: { id: 14 },
      });
    });
  });

  describe('Delete the blog', () => {
    it('should delete the blog ', async () => {
      jest.spyOn(prisma.blog, 'delete').mockResolvedValue(blogs[0]);
      const result = await service.remove(14, 3);
      expect(result).toEqual({ msg: 'Deleted succesfully' });
      expect(prisma.blog.delete).toHaveBeenCalledWith({ where: { id: 14 } });
    });

    it('should throw an error if blog is not found', async () => {
      jest.spyOn(prisma.blog, 'findUnique').mockResolvedValue(null);
      const result = service.remove(14, 3);
      expect(result).rejects.toThrow('Blog you want to delete is not found');
      expect(prisma.blog.findUnique).toHaveBeenCalledWith({
        where: { id: 14 },
      });
    });

    it('should throw error if blog is not being deleted by its creator', async () => {
      jest.spyOn(prisma.blog, 'findUnique').mockResolvedValue(blogs[0]);
      const result = service.remove(14, 4);
      await expect(result).rejects.toThrow(
        'This Blog is not created by the user you provider',
      );
      expect(prisma.blog.findUnique).toHaveBeenCalledWith({
        where: { id: 14 },
      });
    });
  });
});
