import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/infrastructure/jwt-auth.guard';
import { FindAllSupplierQueryDto } from 'src/supplier/dto/find-all-supplier-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  findAll(@Query() query: FindAllSupplierQueryDto) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
