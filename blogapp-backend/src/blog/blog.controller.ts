import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enum/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { BlogEntity } from './entities/blog.entity';
import { AuthsGuard } from '../guards/auths.guard';

@Controller('blogs')
@UseGuards(RolesGuard)
@ApiTags('Blog')
@ApiBearerAuth('access-token')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('post-blog')
  @Roles(Role.User)
  @ApiCreatedResponse({ type: BlogEntity })
  @ApiOperation({ summary: 'Create a blog' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: [BlogEntity],
  })
  create(@Body() createBlogDto: CreateBlogDto, @Request() req: any) {
    createBlogDto.userId = req.userId;
    return this.blogService.create(createBlogDto);
  }

  @Get('get-allBlogs')
  @ApiCreatedResponse({ type: BlogEntity })
  @ApiOperation({ summary: 'List of blogs' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: [BlogEntity],
  })
  async getAllBlogs() {
    const result = await this.blogService.getAllBlogs();
    return { data: result, msg: 'All Blogs' };
  }

  @Get('get-blogs')
  @UseGuards(AuthsGuard)
  @ApiCreatedResponse({ type: BlogEntity })
  @ApiOperation({ summary: 'List of blogs' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: [BlogEntity],
  })
  async findAll(@Request() req: any) {
    const createrId = req.userId;
    const result = await this.blogService.findAll(createrId);
    return { data: result, msg: 'All Blogs' };
  }

  @Patch('update-blog/:id')
  @UseGuards(AuthsGuard)
  @ApiOkResponse({ type: BlogEntity })
  @ApiOperation({ summary: 'Update the particular blog' })
  update(
    @Param('id') blogId: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req: any,
  ) {
    const creatorId = req.userId;
    return this.blogService.update(blogId, updateBlogDto, creatorId);
  }

  @Delete('delete-blog/:id')
  @UseGuards(AuthsGuard)
  @ApiOkResponse({ type: BlogEntity })
  @ApiOperation({ summary: 'Delete a particular blog' })
  remove(@Param('id') blogId: number, @Request() req: any) {
    const creatorId = req.userId;
    return this.blogService.remove(blogId, creatorId);
  }
}
