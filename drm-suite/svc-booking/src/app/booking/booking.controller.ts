import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  CreateResourceDto,
  UpdateResourceDto,
  CreateBookingDto,
  UpdateBookingDto,
  BookingFilterDto,
  ResourceType,
} from './dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Resource endpoints
  @Post('resources')
  @HttpCode(HttpStatus.CREATED)
  createResource(@Body() createResourceDto: CreateResourceDto) {
    return this.bookingService.createResource(createResourceDto);
  }

  @Get('resources')
  findAllResources(
    @Query('type') type?: ResourceType,
    @Query('isActive') isActive?: string,
  ) {
    return this.bookingService.findAllResources(
      type,
      isActive === undefined ? undefined : isActive === 'true',
    );
  }

  @Get('resources/:id')
  findOneResource(@Param('id') id: string) {
    return this.bookingService.findOneResource(id);
  }

  @Get('resources/:id/availability')
  getResourceAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.getResourceAvailability(id, date);
  }

  @Get('resources/:id/utilization')
  getResourceUtilization(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.bookingService.getResourceUtilization(id, startDate, endDate);
  }

  @Patch('resources/:id')
  updateResource(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.bookingService.updateResource(id, updateResourceDto);
  }

  @Delete('resources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeResource(@Param('id') id: string) {
    return this.bookingService.removeResource(id);
  }

  // Booking endpoints
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get()
  findAllBookings(@Query() filter: BookingFilterDto) {
    return this.bookingService.findAllBookings(filter);
  }

  @Get('upcoming/:userId')
  getUpcomingBookings(
    @Param('userId') userId: string,
    @Query('days') days?: string,
  ) {
    return this.bookingService.getUpcomingBookings(
      userId,
      days ? parseInt(days) : 7,
    );
  }

  @Get(':id')
  findOneBooking(@Param('id') id: string) {
    return this.bookingService.findOneBooking(id);
  }

  @Patch(':id')
  updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingService.updateBooking(id, updateBookingDto);
  }

  @Post(':id/cancel')
  cancelBooking(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  @Post(':id/complete')
  completeBooking(@Param('id') id: string) {
    return this.bookingService.completeBooking(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBooking(@Param('id') id: string) {
    return this.bookingService.removeBooking(id);
  }
}
