import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UpdateService } from './update.service';
import { CreateUpdateDto } from './dto/create-update.dto';
import { UpdateUpdateDto } from './dto/update-update.dto';

@Controller('update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Post()
  create(@Body() createUpdateDto: CreateUpdateDto) {
    return this.updateService.create(createUpdateDto);
  }

  @Get()
  findAll() {
    return this.updateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.updateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUpdateDto: UpdateUpdateDto) {
    return this.updateService.update(+id, updateUpdateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.updateService.remove(+id);
  }
}
