import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateResourceDto,
  UpdateResourceDto,
  CreateBookingDto,
  UpdateBookingDto,
  BookingFilterDto,
  BookingStatus,
  ResourceType,
} from './dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  // Resource Management
  async createResource(createResourceDto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: {
        ...createResourceDto,
        metadata: createResourceDto.metadata || {},
      },
    });
  }

  async findAllResources(type?: ResourceType, isActive?: boolean) {
    const where: Prisma.ResourceWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.resource.findMany({
      where,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneResource(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: { startTime: 'asc' },
          take: 10,
        },
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return resource;
  }

  async updateResource(id: string, updateResourceDto: UpdateResourceDto) {
    await this.findOneResource(id);

    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
    });
  }

  async removeResource(id: string) {
    await this.findOneResource(id);

    const hasBookings = await this.prisma.booking.count({
      where: {
        resourceId: id,
        status: { not: BookingStatus.CANCELLED },
        endTime: { gte: new Date() },
      },
    });

    if (hasBookings > 0) {
      throw new BadRequestException(
        'Cannot delete resource with active bookings',
      );
    }

    return this.prisma.resource.delete({
      where: { id },
    });
  }

  // Booking Management
  async createBooking(createBookingDto: CreateBookingDto) {
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot create booking in the past');
    }

    await this.checkResourceAvailability(
      createBookingDto.resourceId,
      startTime,
      endTime,
    );

    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        startTime,
        endTime,
        status: BookingStatus.CONFIRMED,
        priority: createBookingDto.priority || 0,
        metadata: createBookingDto.metadata || {},
      },
      include: {
        resource: true,
        user: true,
        company: true,
        store: true,
      },
    });
  }

  async findAllBookings(filter: BookingFilterDto) {
    const where: Prisma.BookingWhereInput = {};

    if (filter.companyId) {
      where.companyId = filter.companyId;
    }

    if (filter.storeId) {
      where.storeId = filter.storeId;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.resourceId) {
      where.resourceId = filter.resourceId;
    }

    if (filter.resourceType) {
      where.resource = {
        type: filter.resourceType,
      };
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      where.startTime = {};
      if (filter.startDate) {
        where.startTime.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.startTime.lte = new Date(filter.endDate);
      }
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          resource: true,
          user: true,
          company: true,
          store: true,
        },
        take: filter.limit || 20,
        skip: filter.offset || 0,
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      items: bookings,
      total,
    };
  }

  async findOneBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        resource: true,
        user: true,
        company: true,
        store: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOneBooking(id);

    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const startTime = updateBookingDto.startTime
        ? new Date(updateBookingDto.startTime)
        : booking.startTime;
      const endTime = updateBookingDto.endTime
        ? new Date(updateBookingDto.endTime)
        : booking.endTime;

      if (startTime >= endTime) {
        throw new BadRequestException('End time must be after start time');
      }

      await this.checkResourceAvailability(
        booking.resourceId,
        startTime,
        endTime,
        id,
      );

      return this.prisma.booking.update({
        where: { id },
        data: {
          ...updateBookingDto,
          startTime,
          endTime,
        },
        include: {
          resource: true,
          user: true,
          company: true,
          store: true,
        },
      });
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        resource: true,
        user: true,
        company: true,
        store: true,
      },
    });
  }

  async cancelBooking(id: string) {
    const booking = await this.findOneBooking(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        resource: true,
        user: true,
        company: true,
        store: true,
      },
    });
  }

  async completeBooking(id: string) {
    const booking = await this.findOneBooking(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete cancelled booking');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking is already completed');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.COMPLETED },
      include: {
        resource: true,
        user: true,
        company: true,
        store: true,
      },
    });
  }

  async removeBooking(id: string) {
    await this.findOneBooking(id);

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  // Utility Methods
  private async checkResourceAvailability(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    if (!resource.isActive) {
      throw new BadRequestException('Resource is not available for booking');
    }

    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        resourceId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { not: BookingStatus.CANCELLED },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      throw new ConflictException(
        'Resource is already booked for this time period',
      );
    }
  }

  async getResourceAvailability(resourceId: string, date: string) {
    const resource = await this.findOneResource(resourceId);
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookings = await this.prisma.booking.findMany({
      where: {
        resourceId,
        status: { not: BookingStatus.CANCELLED },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const availability = {
      resource,
      date: date,
      bookings,
      availableSlots: this.calculateAvailableSlots(
        bookings,
        startOfDay,
        endOfDay,
      ),
    };

    return availability;
  }

  private calculateAvailableSlots(
    bookings: any[],
    startOfDay: Date,
    endOfDay: Date,
  ) {
    const slots = [];
    let currentTime = new Date(startOfDay);

    bookings.forEach((booking) => {
      if (currentTime < booking.startTime) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(booking.startTime),
        });
      }
      currentTime = new Date(
        Math.max(currentTime.getTime(), booking.endTime.getTime()),
      );
    });

    if (currentTime < endOfDay) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(endOfDay),
      });
    }

    return slots;
  }

  async getUpcomingBookings(userId: string, days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.booking.findMany({
      where: {
        userId,
        status: { not: BookingStatus.CANCELLED },
        startTime: {
          gte: new Date(),
          lte: endDate,
        },
      },
      include: {
        resource: true,
        company: true,
        store: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getResourceUtilization(
    resourceId: string,
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const bookings = await this.prisma.booking.findMany({
      where: {
        resourceId,
        status: { not: BookingStatus.CANCELLED },
        startTime: { gte: start },
        endTime: { lte: end },
      },
    });

    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const bookedHours = bookings.reduce((total, booking) => {
      return (
        total +
        (booking.endTime.getTime() - booking.startTime.getTime()) /
          (1000 * 60 * 60)
      );
    }, 0);

    return {
      resourceId,
      period: { start: startDate, end: endDate },
      totalHours,
      bookedHours,
      utilizationRate: (bookedHours / totalHours) * 100,
      totalBookings: bookings.length,
    };
  }
}
