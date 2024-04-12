import { ApiProperty } from '@nestjs/swagger';
import { Blog } from '@prisma/client';
export class BlogEntity implements Blog {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  author: string;
  @ApiProperty()
  likes: number;
  @ApiProperty()
  userId:number
}
