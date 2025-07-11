import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetClinicStaffQuery } from '@app/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('clinic/:clinicId/all')
  async getClinicStaff(
    @Param('clinicId') clinicId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('type') type?: 'doctor' | 'employee' | 'all',
    @Query('search') search?: string,
    @Query('searchBy') searchBy: 'all' | 'name' | 'email' | 'phone' = 'all',
  ) {
    const query: GetClinicStaffQuery = {
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 10,
      offset: offset ? Math.max(parseInt(offset, 10), 0) : 0,
      type: type || 'all',
      search: search?.trim() || undefined,
      searchBy: searchBy,
    };

    return this.staffService.getClinicStaff(clinicId, query);
  }
}
